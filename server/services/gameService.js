class GameService {
  constructor(roomId) {
    const { broadcast } = require("../gameManager.js")
    this.broadcastFn = (...args) => {
      broadcast(roomId, ...args)
    }
  }
}

module.exports = GameService
