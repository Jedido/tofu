class GameService {
  constructor(roomId) {
    const { broadcast, players } = require("../gameManager.js")
    this.getPlayers = () => players(roomId)
    this.getPlayer = (id) => this.getPlayer().find(socket => socket.id === id)
    this.broadcastFn = (...args) => {
      broadcast(roomId, ...args)
    }
  }
}

module.exports = GameService
