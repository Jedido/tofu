import fs from "fs"
import {
  GachaServiceBase,
  type NoData,
  type RecruitData,
  type GachaUnitData,
  type SummaryData,
  type TSocket,
} from "./gachaServiceBase.ts"

const RECRUIT_SIZE = 5
const RATE_THRESHOLDS = [0.07, 0.21, 0.47, 1]
const ALIGNMENT_TYPES = 4

interface PlayerStats {
  pity: number
  results: string[]
}

type PlayerSession = (number | GachaUnitData)[]

export default class extends GachaServiceBase {
  sessions: Record<string, PlayerSession> = {}
  stats: Record<string, PlayerStats> = {}
  recruitPool: Record<string, string[][]>
  gachaData: Record<string, GachaUnitData>

  constructor(roomId: string) {
    super(roomId)
    this.recruitPool = JSON.parse(
      fs.readFileSync("./server/assets/pool.json", "utf8").trim()
    )
    this.gachaData = JSON.parse(
      fs.readFileSync("./server/assets/gacha.json", "utf8").trim()
    )
  }

  startRecruitAction(_data: NoData, socket: TSocket) {
    const cards: number[] = []
    for (let i = 0; i < RECRUIT_SIZE; i++) {
      cards.push(Math.floor(Math.random() * ALIGNMENT_TYPES))
    }
    this.sessions[socket.id] = cards
    if (!(socket.id in this.stats)) {
      this.stats[socket.id] = { pity: 0, results: [] }
    }
    this.sendStart(cards, socket)
  }

  recruitAction({ index }: RecruitData, socket: TSocket) {
    const session = this.sessions[socket.id]
    if (!session || index === null || index < 0 || index >= RECRUIT_SIZE) return
    const alignment = session[index]
    if (typeof alignment !== "object") {
      const stats = this.stats[socket.id]
      const threshold = Math.random()
      let rarity
      for (rarity = 0; rarity < RATE_THRESHOLDS.length; rarity++) {
        if (RATE_THRESHOLDS[rarity] > threshold) break
      }
      if (rarity === 0) {
        stats.pity++
      } else {
        stats.pity = 0
      }
      const pool = this.recruitPool[alignment][rarity]
      const unitID = pool[Math.floor(Math.random() * pool.length)]
      const character = this.gachaData[unitID]
      session[index] = character
      stats.results.push(unitID)
    }
    this.sendRecruitResult(
      { index, character: session[index] as GachaUnitData },
      socket
    )
  }

  endRecruitAction(_data: NoData, socket: TSocket) {
    const sessionResult = this.sessions[socket.id]
    if (!sessionResult) return
    delete this.sessions[socket.id]
    this.sendSummary(sessionResult as unknown as SummaryData, socket)
  }

  getStatsAction(_data: NoData, socket: TSocket) {
    const stats = this.stats[socket.id]
    if (!stats) {
      this.sendStats({ history: [], pity: 0 }, socket)
    }
    const history: GachaUnitData[] = []
    for (const unitID in stats.results) {
      history.push(this.gachaData[unitID])
    }
    this.sendStats({ history, pity: stats.pity }, socket)
  }
}
