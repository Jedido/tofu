class GameService {
  constructor(roomId) {
    const { broadcast, players } = require("../gameManager.js")
    this.players = () => players(roomId)
    this.broadcastFn = (...args) => {
      broadcast(roomId, ...args)
    }
  }
}

module.exports = GameService
