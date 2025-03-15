import { BaseHttpClient } from "./baseHttpClient"

interface MALQuery {
  path: string
  params: Record<string, string>
}

const DEFAULT_MAL_RETRY_CONFIG = {
  maxRetries: 3,
  delayMs: 1000,
  retryableStatuses: [429]
}

class BaseMALClient<T, V> extends BaseHttpClient<T, V> {
  constructor(name: string = "mal-client") {
    super(name, DEFAULT_MAL_RETRY_CONFIG)
  }

  makeQuery(input: MALQuery): Request {
    const url = `https://api.jikan.moe/v4${input.path}?`
    const params = new URLSearchParams(input.params).toString()
    return new Request(
      url + params,
      {
        method: "GET",
      }
    )
  }

  convertOutFromResponse(res: string): any {
    return JSON.parse(res)
  }
}

export interface Anime {
  mal_id: number
  aired: {
    from: string
    to: string
  },
  url: string
  images: {
    jpg: {
      image_url: string
    }
  }
  trailer: {
    youtube_id: string
    url: string
    embed_url: string
  }
  title: string
  title_english: string
  title_synonyms: string[]
  rank: number
  score: number
  popularity: number
  source: string
  status: string
  type: string
  genres: {
    mal_id: number
    type: string
    name: string
  }[]
  synopsis: string
}
export interface FullAnime extends Anime {
  relations: {
    relation: string
    entry: {
      mal_id: number
      type: string
      name: string
    }[]
  }[]
  theme: {
    openings: string[]
    endings: string[]
  }
}
export interface Character {
  mal_id: number
  images: {
    jpg: {
      image_url: string
    }
  }
  url: string
  name: string
  role: string
}

export interface MALGetByIdRequest {
  mal_id: number
}
interface MALGetAnimeResponse {
  data: FullAnime
}
export class MALGetAnimeClient extends BaseMALClient<MALGetByIdRequest, MALGetAnimeResponse> {
  convertInToRequest(input: MALGetByIdRequest): Request {
    return this.makeQuery({
      path: `/anime/${input.mal_id}/full`,
      params: {}
    })
  }

  stringifyOut(out: MALGetAnimeResponse): string {
    return `${out.data.mal_id}: ${out.data.title}`
  }
}


interface MALSearchAnimeRequest {
  query?: string
  type?: "tv" | "movie" | "ova" | "special" | "ona" | "music" | "cm" | "pv" | "tv_special"
  order_by?: "mal_id" | "title" | "start_date" | "end_date" | "episodes" | "score" | "scored_by" | "rank" | "popularity" | "members" | "favorites" | "date_added"
  sort?: "desc" | "asc"
  limit?: number
  page?: number
}
export interface MALSearchAnimeResponse {
  data: Anime[]
}
export class MALSearchAnimeClient extends BaseMALClient<MALSearchAnimeRequest, MALSearchAnimeResponse> {
  convertInToRequest(input: MALSearchAnimeRequest) {
    return this.makeQuery({
      path: "/anime",
      params: {
        q: input.query || "",
        type: input.type || "tv",
        sort: input.sort || "asc",
        order_by: input.order_by || "popularity",
        limit: `${input.limit || 5}`,
        page: `${input.page || 1}`,
      }
    })
  }

  stringifyOut(out: MALSearchAnimeResponse): string {
    if (!out.data) {
      return ""
    }
    return out.data.map(anime => `${anime.mal_id}: ${anime.title}`).join(", ")
  }
}

interface MALGetCharactersResponse {
  data: {
    character: Character
  }[]
}
export class MALGetCharactersClient extends BaseMALClient<MALGetByIdRequest, MALGetCharactersResponse> {
  convertInToRequest(input: MALGetByIdRequest): Request {
    return this.makeQuery({
      path: `/anime/${input.mal_id}/characters`,
      params: {}
    })
  }

  stringifyOut(out: MALGetCharactersResponse): string {
    return `${out.data.length} characters`
  }
}