import { MALSearchAnimeClient, MALSearchAnimeResponse } from "../clients/malClient"
import fs from "fs"
import { initDatabaseManager, run, get } from "../databaseManager"

const client = new MALSearchAnimeClient()

async function fetchWindow(page: number, limit: number): Promise<MALSearchAnimeResponse> {
  const response = await client.fetch({
    limit,
    page,
    order_by: 'popularity',
    sort: 'asc',
    type: 'tv'
  })
  return response
}

const numAnimeTotal = 10000
const animePerCall = 20

async function fetchAll() {
  for (let i = 81; i <= numAnimeTotal / animePerCall; i ++) {
    const response: MALSearchAnimeResponse = await fetchWindow(i, animePerCall)
    response.data.forEach(anime => {
      [anime.title, anime.title_english, ...anime.title_synonyms].forEach(title => {
        run("INSERT OR IGNORE INTO anime_autocomplete (aka, title, mal_id) VALUES (?, ?, ?)", title, anime.title, anime.mal_id)
      })
    })
    await new Promise(resolve => setTimeout(resolve, 600))
  }
}

initDatabaseManager()
fetchAll().then(() => {
  console.log("Done")
})
