import { describe, expect, test } from "bun:test"
import { FullAnime } from "../../clients/malClient"

import AnidleService from "../../services/anidle/anidleService.ts"

describe("Anidle Service", () => {
  const service = new AnidleService("TEST")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = service as any

  test("should have the right id", () => {
    expect(service.id).toBe("anidle")
  })

  test("should fetch an anime", async () => {
    const anime = await svc.findRandomAnime()
    expect(anime).toBeDefined()
  })

  test("should fetch an anime with a distant source", async () => {
    // AoT: Final Season Part 2
    const fullAnime: FullAnime = await svc.getFullAnime(48583)
    const sourceAnime: FullAnime = await svc.getSourceFromFullAnime(fullAnime)
    expect(sourceAnime.mal_id).toBe(16498)
  }, 30000)

  test("should fetch an anime with a distant source - Boku no Hero Academia", async () => {
    const fullAnime: FullAnime = await svc.getFullAnime(49918)
    const sourceAnime: FullAnime = await svc.getSourceFromFullAnime(fullAnime)
    expect(sourceAnime.mal_id).toBe(31964)
  }, 30000)

  test("should fetch an anime from cache", async () => {
    const anime = await svc.findRandomAnime()
    await svc.getFullAnime(anime.mal_id)

    const startTime = performance.now()
    const cachedAnime = await svc.getFullAnime(anime.mal_id)
    const endTime = performance.now()
    const duration = endTime - startTime

    expect(cachedAnime.mal_id).toBe(anime.mal_id)
    expect(duration).toBeLessThan(100) // Should take less than 100ms
  })
})
