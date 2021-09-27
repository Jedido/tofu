const GameService = require("./gameService.js")

const fs = require("fs")
const RECRUIT_SIZE = 5
const RATE_THRESHOLDS = [0.07, 0.21, 0.47, 1]
const ALIGNMENT_TYPES = 4

// Note: this could all be better implemented as REST POST/GET requests
class GachaService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "gacha-start-recruit": this.startRecruit.bind(this),
      "gacha-recruit": this.recruit.bind(this),
      "gacha-end-recruit": this.endRecruit.bind(this),
      "gacha-get-stats": this.getStats.bind(this),
    }

    // responses
    this.startEvent = "gacha-start"
    this.recruitEvent = "gacha-recruit-result"
    this.summaryEvent = "gacha-summary"
    this.statsEvent = "gacha-stats"

    // game state
    this.sessions = {}
    this.stats = {}
    const recruitFile = fs.readFileSync("./server/assets/pool.json", "utf8")
    this.recruitPool = JSON.parse(recruitFile.trim())
    const gachaFile = fs.readFileSync("./server/assets/gacha.json", "utf8")
    this.gachaData = JSON.parse(gachaFile.trim())
  }

  startRecruit(_, socket) {
    const cards = []
    for (let i = 0; i < RECRUIT_SIZE; i++) {
      cards.push(Math.floor(Math.random() * ALIGNMENT_TYPES))
    }
    this.sessions[socket.id] = cards
    if (!(socket.id in this.stats)) {
      this.stats[socket.id] = {
        pity: 0,
        results: [],
      }
    }
    socket.emit(this.startEvent, cards)
  }

  recruit(message, socket) {
    const { index } = message
    const session = this.sessions[socket.id]
    if (!session || index === null || index < 0 || index >= RECRUIT_SIZE) {
      // invalid message somehow
      return
    }
    const alignment = session[index]
    // if not already recruited (if call was duplicated somehow)
    if (typeof alignment !== Object) {
      const stats = this.stats[socket.id]

      // rarity
      const threshold = Math.random()
      let rarity
      for (rarity = 0; rarity < RATE_THRESHOLDS.length; rarity++) {
        if (RATE_THRESHOLDS[rarity] > threshold) {
          break
        }
      }
      if (rarity === 0) {
        stats.pity++
      } else {
        stats.pity = 0
      }

      // unit
      const pool = this.recruitPool[alignment][rarity]
      const unitID = pool[Math.floor(Math.random() * pool.length)]
      const unit = this.gachaData[unitID]
      session[index] = unit

      // add to stats efficiently
      stats.results.push(unitID)
    }
    socket.emit(this.recruitEvent, index, session[index])
  }

  endRecruit(message, socket) {
    const sessionResult = this.sessions[socket.id]
    if (!sessionResult) {
      return
    }
    delete this.sessions[socket.id]
    socket.emit(this.summaryEvent, sessionResult)
  }

  getStats(message, socket) {
    const stats = this.stats[socket.id]
    if (!stats) {
      socket.emit(this.statsEvent, {
        history: [],
        pity: 0,
      })
    }
    const history = []
    for (const unitID in stats.history) {
      history.push(this.gachaData[unitID])
    }
    // sounds like this could get big...paginate or remodel
    socket.emit(this.statsEvent, {
      history,
      pity: stats.pity,
    })
  }
}
GachaService.prototype.id = "gacha"

module.exports = GachaService
