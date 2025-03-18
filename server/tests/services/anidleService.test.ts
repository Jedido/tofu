import { FullAnime } from "../../clients/malClient"

const AnidleService = require("../../services/anidleService.ts")

describe("Anidle Service", () => {
  const service = new AnidleService("TEST")
  test("should have the right id", () => {
    expect(service.id).toBe("anidle")
  })

  test("should fetch an anime", async () => {
    const anime = await service.findRandomAnime()
    expect(anime).toBeDefined()
  })

  test("should fetch an anime with a distant source", async () => {
    // AoT: Final Season Part 2
    const fullAnime: FullAnime = await service.getFullAnime(48583)
    const sourceAnime: FullAnime = await service.getSourceFromFullAnime(fullAnime)
    expect(sourceAnime.mal_id).toBe(16498)
  }, 30000) 

  test("should fetch an anime from cache", async () => {
    const anime = await service.findRandomAnime()
    await service.getFullAnime(anime.mal_id)
    
    const startTime = performance.now()
    const cachedAnime = await service.getFullAnime(anime.mal_id)
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(cachedAnime.mal_id).toBe(anime.mal_id)
    expect(duration).toBeLessThan(100)  // Should take less than 100ms
  })
})