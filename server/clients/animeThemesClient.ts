import { BaseHttpClient } from "./baseHttpClient"
import { MALGetByIdRequest } from "./malClient"

interface AnimeThemesResponse {
  id: number
  name: string
  animethemes: {
    id: number
    slug: string
    type: string
    song: {
      id: number
      title: string
    }
    animethemeentries: {
      id: number
      videos: {
        id: number
        link: string
        audio: {
          id: number
          link: string
        }
      }[]
    }[]
  }[]
}
export class AnimeThemesClient extends BaseHttpClient<MALGetByIdRequest, AnimeThemesResponse> {
  constructor(name: string = "animethemes-client") {
    super(name)
  }

  convertInToRequest(input: MALGetByIdRequest): Request {
    const url = `https://api.animethemes.moe/anime?filter[has]=resources&filter[site]=MyAnimeList&filter[external_id]=${input.mal_id}&include=animethemes.animethemeentries.videos.audio,animethemes.song`
    return new Request(
      url,
      {
        method: "GET",
      }
    )
  }

  convertOutFromResponse(res: string): AnimeThemesResponse {
    return JSON.parse(res).anime[0]
  }

  stringifyOut(out: AnimeThemesResponse): string {
    return `${out.animethemes.map(theme => `${theme.slug}: ${theme.song.title}`).join(", ")}`
  }
}
