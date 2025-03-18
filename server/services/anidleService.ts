import { AnimeThemesClient } from "../clients/animeThemesClient"
import { MALGetAnimeClient, MALSearchAnimeClient, Anime, FullAnime, MALGetCharactersClient } from "../clients/malClient"
import { TSocket } from "../utils/tsocket"
import { get, run } from "../databaseManager"

const GameService = require("./gameService.js")

interface Guess {
  mal_id: number,
  title: string,
  user: string,
  correct?: boolean,
  image_url?: string
}

class AnidleService extends GameService {
  readonly actions = {
    "anidle-start": this.startGame.bind(this),
    "anidle-guess": this.guess.bind(this),
    "anidle-autocomplete": this.autocomplete.bind(this),
    "anidle-get-state": this.state.bind(this)
  }

  readonly loadingEvent: string = "anidle-loading"
  readonly startEvent: string = "anidle-init-game"
  readonly guessStartEvent: string = "anidle-guess-start"
  readonly guessEvent: string = "anidle-guess-result"
  readonly repeatGuessEvent: string = "anidle-repeat-guess"
  readonly autocompleteEvent: string = "anidle-autocomplete-result"
  readonly winEvent: string = "anidle-win"

  anime?: FullAnime
  animeSource?: FullAnime
  themes?: {
    id: number
    title: string
    type: string
    slug: string
    link: string
  }[]
  malSearchAnimeClient: MALSearchAnimeClient
  malGetAnimeClient: MALGetAnimeClient
  malGetCharactersClient: MALGetCharactersClient
  animeThemesClient: AnimeThemesClient
  awaitingNext: boolean
  guesses: Guess[]
  loading: boolean
  revealedData?: {
    source: string
    correctGenres: string[]
    incorrectGenres: string[]
    popularityMin?: number
    popularityMax?: number
    rankMin?: number
    rankMax?: number
    scoreMin?: number
    scoreMax?: number
    airedStartMin?: Date
    airedStartMax?: Date
    airedEndMin?: Date
    airedEndMax?: Date
  }
  revealedSynopsis: boolean[]
  selectedAudio?: {
    track: {
      id: number
      title: string
      type: string
      slug: string
      link: string
    }
    start: number
  }
  won: boolean

  constructor(roomId: string) {
    super(roomId)
    this.malSearchAnimeClient = new MALSearchAnimeClient()
    this.malGetAnimeClient = new MALGetAnimeClient()
    this.malGetCharactersClient = new MALGetCharactersClient()
    this.animeThemesClient = new AnimeThemesClient()
    this.awaitingNext = true
    this.guesses = []
    this.revealedSynopsis = []
    this.loading = false
    this.won = false
  }

  async startGame() {
    this.loading = true
    this.won = false
    this.record = []
    this.guesses = []
    this.enemy = undefined
    this.currentActor = 0
    this.broadcastFn(this.loadingEvent)

    const selectedAnime = await this.findRandomAnime()
    const mal_id = selectedAnime.mal_id
    const animeSourcePromise = this.malGetAnimeClient.fetch({ mal_id }).then((animeResponse: { data: FullAnime }) => {
      this.anime = animeResponse.data
      return this.getSourceFromFullAnime(animeResponse.data)
    })
    const animeThemesPromise = this.animeThemesClient.fetch({ mal_id })
    const [animeThemesResponse, animeSourceResponse] = await Promise.all([animeThemesPromise, animeSourcePromise])

    this.revealedData = {
      source: "",
      correctGenres: [],
      incorrectGenres: []
    }
    this.themes = animeThemesResponse.animethemes.map(theme => {
      return {
        id: theme.id,
        title: theme.song.title,
        link: theme.animethemeentries[0].videos[0].audio.link,
        type: theme.type,
        slug: theme.slug,
      }
    })
    this.animeSource = animeSourceResponse
    this.anime!.synopsis = this.anime!.synopsis
      .replace("[Written by MAL Rewrite]", "")
      .trim()
    this.awaitingNext = true
    this.selectedAudio = {
      track: this.themes[Math.floor(Math.random() * this.themes.length)],
      start: Math.random() * 90
    }
    this.broadcastFn(this.startEvent, {
      synopsis: this.anime!.synopsis,
      audioClue: this.selectedAudio,
      revealedData: this.revealedData
    })
    this.loading = false
  }

  async findRandomAnime(min: number = 1, max: number = 300): Promise<Anime> {
    if (min < 1) {
      min = 1
    }
    // There are about 8000 eligible anime
    if (max > 8000) {
      max = 8000
    }
    const animePopularity = Math.floor(Math.random() * (max - min + 1)) + min
    const anime: Anime = (await this.malSearchAnimeClient.fetch({ 
      limit: 1,
      page: animePopularity,
      order_by: 'popularity',
      sort: 'asc',
      type: 'tv'
    })).data[0]
    return anime
  }

  async getFullAnime(mal_id: number): Promise<FullAnime> {
    // updated in the last 30 days
    const dateThreshold = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
    const anime = await get("SELECT json FROM mal_anime_cache WHERE mal_id = ? AND updated_at > ? LIMIT 1", 
      mal_id, 
      dateThreshold.toISOString()
    )
    if (anime.length > 0) {
      return JSON.parse(anime[0].json)
    }
    return this.malGetAnimeClient.fetch({ mal_id }).then(async (res) => {
      await new Promise(resolve => setTimeout(resolve, 700))
      const anime = res.data
      await run("INSERT OR REPLACE INTO mal_anime_cache (mal_id, json, updated_at) VALUES (?, ?, ?)", 
        mal_id, 
        JSON.stringify(anime), 
        new Date().toISOString()
      )
      return anime
    })
  }

  async getSourceId(mal_id: number): Promise<number> {
    const mal_ids = await get("SELECT source_id FROM anime_sources WHERE mal_id = ?", mal_id)
    if (mal_ids.length > 0) {
      return mal_ids[0].source_id
    }
    return -1
  }

  async getSourceFromFullAnime(sourceAnime: FullAnime): Promise<FullAnime> {
    let sourceId = await this.getSourceId(sourceAnime.mal_id)
    if (sourceId !== -1) {
      return await this.getFullAnime(sourceId)
    }

    const animeWithoutSources: number[] = [sourceAnime.mal_id]
    do {
      const prequels = sourceAnime.relations.find(r => r.relation === 'Prequel')?.entry.map(e => e.mal_id) || [-1]
      sourceId = Math.min(...prequels)
      if (sourceId === -1) {
        sourceId = sourceAnime.mal_id
        break
      }
      const cachedSourceId = await this.getSourceId(sourceId)
      if (cachedSourceId !== -1) {
        sourceId = cachedSourceId
        break
      } else {
        animeWithoutSources.push(sourceId)
      }
      sourceAnime = (await this.getFullAnime(sourceId))
    } while (sourceId !== -1);

    animeWithoutSources.forEach(async (id) => {
      await run("INSERT INTO anime_sources (mal_id, source_id) VALUES (?, ?)", id, sourceId)
    })
    return sourceAnime
  }

  async state(_: Object, socket: TSocket) {
    socket.emit(this.stateEvent, {
      loading: this.loading,
      revealedData: this.revealedData,
      synopsis: this.anime?.synopsis,
      guesses: this.guesses,
      selectedAudio: this.selectedAudio,
      revealedSynopsis: this.revealedSynopsis
    })
  }

  async guess({ title, mal_id }: Guess, socket: TSocket) {
    if (this.won) {
      socket.emit(this.repeatGuessEvent, { name: this.guesses[this.guesses.length - 1].mal_id })
      return
    }
    const index = this.guesses.findIndex(g => g.mal_id === mal_id)
    if (index !== -1) {
      socket.emit(this.repeatGuessEvent, { name: this.guesses[index].mal_id })
      return
    }
    const guessResult: Guess = {
      mal_id,
      title,
      user: socket.ign
    }
    this.broadcastFn(this.guessStartEvent, guessResult)
    this.guesses.push(guessResult)

    if (!this.revealedData || !this.anime || !this.animeSource) {
      return
    }

    // Check win
    let anime: FullAnime
    let source: FullAnime
    if (mal_id === this.anime.mal_id) {
      this.broadcastFn(this.winEvent, { title: this.anime.title })
      anime = this.anime
      source = this.animeSource
    } else {
      anime = await this.getFullAnime(mal_id)
      source = await this.getSourceFromFullAnime(anime)
    }

    // Update source
    if (this.animeSource.title === source.title) {
      this.revealedData.source = source.title
    }
    // Update genres
    anime.genres.forEach(genre => {
      if (this.anime!.genres.find(g => g.name === genre.name)) {
        if (!this.revealedData!.correctGenres.includes(genre.name)) {
          this.revealedData!.correctGenres.push(genre.name)
        }
      } else {
        if (!this.revealedData!.incorrectGenres.includes(genre.name)) {
          this.revealedData!.incorrectGenres.push(genre.name)
        }
      }
    })

    // Update popularity range
    const popularityRange = this.clamp(anime.popularity, this.anime.popularity, this.revealedData.popularityMin, this.revealedData.popularityMax)
    this.revealedData.popularityMin = popularityRange.min
    this.revealedData.popularityMax = popularityRange.max

    // Update rank range
    const rankRange = this.clamp(anime.rank, this.anime.rank, this.revealedData.rankMin, this.revealedData.rankMax)
    this.revealedData.rankMin = rankRange.min
    this.revealedData.rankMax = rankRange.max

    // Update score range
    const scoreRange = this.clamp(anime.score, this.anime.score, this.revealedData.scoreMin, this.revealedData.scoreMax)
    this.revealedData.scoreMin = scoreRange.min
    this.revealedData.scoreMax = scoreRange.max

    // Update aired range
    const airedFromRange = this.clamp(new Date(anime.aired.from), new Date(this.anime.aired.from), this.revealedData.airedStartMin, this.revealedData.airedStartMax)
    this.revealedData.airedStartMin = airedFromRange.min
    this.revealedData.airedStartMax = airedFromRange.max

    const airedToRange = this.clamp(new Date(anime.aired.to), new Date(this.anime.aired.to), this.revealedData.airedEndMin, this.revealedData.airedEndMax)
    this.revealedData.airedEndMin = airedToRange.min
    this.revealedData.airedEndMax = airedToRange.max

    guessResult.image_url = anime.images.jpg.image_url
    guessResult.correct = mal_id === this.anime.mal_id
    const synopsisLength = this.anime.synopsis.split(" ").length
    const numRevealed = Math.min(5, Math.floor(synopsisLength / 20))
    const eligible = Array.from({ length: synopsisLength }, (_, i) => i).filter(i => !this.revealedSynopsis[i])
    let revealIndices = []
    if (eligible.length < numRevealed) {
      revealIndices = eligible
    } else {
      for (let i = 0; i < numRevealed; i++) {
        const randomIndex = Math.floor(Math.random() * eligible.length)
        revealIndices.push(eligible.splice(randomIndex, 1)[0])
      }
    }
    this.broadcastFn(this.guessEvent, {
      revealedData: this.revealedData,
      guess: guessResult,
      revealIndices: revealIndices
    })
  }

  clamp(value: any, target: any, min?: any, max?: any): { min?: any, max?: any } {
    if (value > target) {
      if (!max || max > value) {
        max = value
      }
    } else if (value < target) {
      if (!min || min < value) {
        min = value
      }
    } else {
      max = target
      min = target
    }
    return { min, max }
  }

  async autocomplete(query: string, socket: TSocket) {
    const matches = await get("SELECT * FROM anime_autocomplete WHERE aka LIKE ? LIMIT 200", `%${query}%`)
    if (matches.length < 200) {
      socket.emit(this.autocompleteEvent, { options: matches, query })
    }
  }
}
AnidleService.prototype.id = "anidle"

module.exports = AnidleService