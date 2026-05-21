import { AnimeThemesClient } from "../../clients/animeThemesClient.ts"
import {
  MALGetAnimeClient,
  MALSearchAnimeClient,
  type Anime,
  type FullAnime,
  MALGetCharactersClient,
} from "../../clients/malClient.ts"
import { get, run } from "../../databaseManager.ts"
import { randomItem } from "../../utils/util.ts"
import {
  AnidleServiceBase,
  type StartData,
  type GuessData,
  type QueryData,
  type NoData,
  type RevealedData,
  type GuessInfoData,
  type TSocket,
} from "./anidleServiceBase.ts"

interface Guess {
  mal_id: number
  title: string
  user: string
  correct?: boolean
  image_url?: string
}

export default class extends AnidleServiceBase {
  malSearchAnimeClient: MALSearchAnimeClient
  malGetAnimeClient: MALGetAnimeClient
  malGetCharactersClient: MALGetCharactersClient
  animeThemesClient: AnimeThemesClient
  anime?: FullAnime
  animeSource?: FullAnime
  awaitingNext: boolean
  guesses: Guess[]
  loading: boolean
  revealedData?: RevealedData
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
  settings: NonNullable<StartData>

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
    this.settings = { maxPopularity: 200, themeType: "ALL" }
  }

  async startAction(data: StartData, _sender: TSocket) {
    if (data) {
      this.settings = data
    }
    this.loading = true
    this.won = false
    this.guesses = []
    this.currentActor = 0
    this.sendLoading(null)

    const selectedAnime = await this.findRandomAnime()
    const mal_id = selectedAnime.mal_id
    const animeSourcePromise = this.getFullAnime(mal_id).then(
      (animeResponse: FullAnime) => {
        this.anime = animeResponse
        return this.getSourceFromFullAnime(animeResponse)
      }
    )
    const animeThemesPromise = this.animeThemesClient.fetch({ mal_id })
    const [animeThemesResponse, animeSourceResponse] = await Promise.all([
      animeThemesPromise,
      animeSourcePromise,
    ])

    this.revealedData = {
      source: "",
      correctGenres: [],
      incorrectGenres: [],
    }
    const availableThemes = animeThemesResponse.animethemes
      .map((theme) => ({
        id: theme.id,
        title: theme.song.title,
        link: (
          theme.animethemeentries.find((e) => !e.spoiler) ||
          theme.animethemeentries[0]
        ).videos[0].audio.link,
        type: theme.type,
        slug: theme.slug,
      }))
      .filter(
        (theme) =>
          this.settings.themeType === "ALL" ||
          theme.type === this.settings.themeType
      )
    this.animeSource = animeSourceResponse
    this.anime!.synopsis = this.anime!.synopsis.replace(
      "[Written by MAL Rewrite]",
      ""
    ).trim()
    this.awaitingNext = true
    this.selectedAudio = {
      track: randomItem(availableThemes),
      start: Math.random() * 90,
    }
    this.sendInitGame({
      synopsis: this.anime!.synopsis,
      audioClue: this.selectedAudio,
      revealedData: this.revealedData,
    })
    this.loading = false
  }

  async guessAction({ title, mal_id }: GuessData, socket: TSocket) {
    if (this.won) {
      this.sendRepeatGuess(
        { name: this.guesses[this.guesses.length - 1].mal_id },
        socket
      )
      return
    }
    const index = this.guesses.findIndex((g) => g.mal_id === mal_id)
    if (index !== -1) {
      this.sendRepeatGuess({ name: this.guesses[index].mal_id }, socket)
      return
    }
    const guessResult: GuessInfoData = { mal_id, title, user: socket.ign }
    this.sendGuessStart(guessResult)
    this.guesses.push(guessResult)

    if (!this.revealedData || !this.anime || !this.animeSource) return

    const correct = mal_id === this.anime.mal_id
    let anime: FullAnime
    let source: FullAnime
    if (correct) {
      this.won = true
      anime = this.anime
      source = this.animeSource
    } else {
      anime = await this.getFullAnime(mal_id)
      source = await this.getSourceFromFullAnime(anime)
    }

    if (this.animeSource.title === source.title) {
      this.revealedData.source = source.title
    }
    anime.genres.forEach((genre) => {
      if (this.anime!.genres.find((g) => g.name === genre.name)) {
        if (!this.revealedData!.correctGenres.includes(genre.name)) {
          this.revealedData!.correctGenres.push(genre.name)
        }
      } else {
        if (!this.revealedData!.incorrectGenres.includes(genre.name)) {
          this.revealedData!.incorrectGenres.push(genre.name)
        }
      }
    })

    const popularityRange = this.clamp(
      anime.popularity,
      this.anime.popularity,
      this.revealedData.popularityMin,
      this.revealedData.popularityMax
    )
    this.revealedData.popularityMin = popularityRange.min
    this.revealedData.popularityMax = popularityRange.max

    const rankRange = this.clamp(
      anime.rank,
      this.anime.rank,
      this.revealedData.rankMin,
      this.revealedData.rankMax
    )
    this.revealedData.rankMin = rankRange.min
    this.revealedData.rankMax = rankRange.max

    const scoreRange = this.clamp(
      anime.score,
      this.anime.score,
      this.revealedData.scoreMin,
      this.revealedData.scoreMax
    )
    this.revealedData.scoreMin = scoreRange.min
    this.revealedData.scoreMax = scoreRange.max

    const airedFromRange = this.clamp(
      new Date(anime.aired.from),
      new Date(this.anime.aired.from),
      this.revealedData.airedStartMin,
      this.revealedData.airedStartMax
    )
    this.revealedData.airedStartMin = airedFromRange.min
    this.revealedData.airedStartMax = airedFromRange.max

    const airedToRange = this.clamp(
      new Date(anime.aired.to),
      new Date(this.anime.aired.to),
      this.revealedData.airedEndMin,
      this.revealedData.airedEndMax
    )
    this.revealedData.airedEndMin = airedToRange.min
    this.revealedData.airedEndMax = airedToRange.max

    guessResult.image_url = anime.images.jpg.image_url
    guessResult.correct = correct
    const synopsisSplit = this.anime.synopsis.split(" ")
    const synopsisLength = synopsisSplit.length
    const numRevealed = Math.min(5, Math.floor(synopsisLength / 10))
    const eligible = Array.from({ length: synopsisLength }, (_, i) => i).filter(
      (i) =>
        !this.revealedSynopsis[i] &&
        synopsisSplit[i].charAt(0) !== synopsisSplit[i].charAt(0).toUpperCase()
    )
    let revealIndices: number[] = []
    if (eligible.length < numRevealed) {
      revealIndices = eligible
    } else {
      for (let i = 0; i < numRevealed; i++) {
        const randomIndex = Math.floor(Math.random() * eligible.length)
        revealIndices.push(eligible.splice(randomIndex, 1)[0])
      }
    }
    this.sendGuessResult({
      revealedData: this.revealedData,
      guess: guessResult,
      revealIndices,
    })
    if (correct) {
      this.sendWin({ title: this.anime.title })
    }
  }

  async autocompleteAction(data: QueryData, socket: TSocket) {
    const matches = await get(
      "SELECT * FROM anime_autocomplete WHERE aka LIKE ? LIMIT 200",
      `%${data}%`
    )
    if (matches.length < 200) {
      this.sendAutocompleteResult({ options: matches, query: data }, socket)
    }
  }

  async getStateAction(_data: NoData, socket: TSocket) {
    socket.emit("anidle-state", {
      loading: this.loading,
      revealedData: this.revealedData,
      synopsis: this.anime?.synopsis,
      guesses: this.guesses,
      selectedAudio: this.selectedAudio,
      revealedSynopsis: this.revealedSynopsis,
    })
  }

  private async findRandomAnime(
    min: number = 1,
    max: number = 200
  ): Promise<Anime> {
    if (min < 1) min = 1
    if (max > 8000) max = 8000
    const animePopularity = Math.floor(Math.random() * (max - min + 1)) + min
    const anime: Anime = (
      await this.malSearchAnimeClient.fetch({
        limit: 1,
        page: animePopularity,
        order_by: "popularity",
        sort: "asc",
        type: "tv",
      })
    ).data[0]
    return anime
  }

  private async getFullAnime(mal_id: number): Promise<FullAnime> {
    const dateThreshold = new Date(
      new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    )
    const anime = await get(
      "SELECT json FROM mal_anime_cache WHERE mal_id = ? AND updated_at > ? LIMIT 1",
      mal_id,
      dateThreshold.toISOString()
    )
    if (anime.length > 0) {
      return JSON.parse((anime[0] as { json: string }).json)
    }
    return this.malGetAnimeClient.fetch({ mal_id }).then(async (res) => {
      await new Promise((resolve) => setTimeout(resolve, 700))
      const anime = res.data
      await run(
        "INSERT OR REPLACE INTO mal_anime_cache (mal_id, json, updated_at) VALUES (?, ?, ?)",
        mal_id,
        JSON.stringify(anime),
        new Date().toISOString()
      )
      return anime
    })
  }

  private async getSourceId(mal_id: number): Promise<number> {
    const mal_ids = await get(
      "SELECT source_id FROM anime_sources WHERE mal_id = ?",
      mal_id
    )
    if (mal_ids.length > 0)
      return (mal_ids[0] as { source_id: number }).source_id
    return -1
  }

  private async getSourceFromFullAnime(
    sourceAnime: FullAnime
  ): Promise<FullAnime> {
    let sourceId = await this.getSourceId(sourceAnime.mal_id)
    if (sourceId !== -1) return await this.getFullAnime(sourceId)

    const animeWithoutSources: number[] = [sourceAnime.mal_id]
    do {
      const prequels = sourceAnime.relations
        .find((r) => r.relation === "Prequel")
        ?.entry.map((e) => e.mal_id) || [-1]
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
      sourceAnime = await this.getFullAnime(sourceId)
    } while (sourceId !== -1)

    animeWithoutSources.forEach(async (id) => {
      await run(
        "INSERT INTO anime_sources (mal_id, source_id) VALUES (?, ?)",
        id,
        sourceId
      )
    })
    return sourceAnime
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private clamp(value: any, target: any, min?: any, max?: any) {
    if (value > target) {
      if (!max || max > value) max = value
    } else if (value < target) {
      if (!min || min < value) min = value
    } else {
      max = target
      min = target
    }
    return { min, max }
  }
}
