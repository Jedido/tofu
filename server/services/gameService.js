class GameService {
  constructor(roomId) {
    const { broadcast, players } = require("../gameManager.js")
    this.getPlayers = () => players(roomId)
    this.getPlayer = (id) => this.getPlayers().find(socket => socket.id === id)
    this.broadcastFn = (...args) => {
      broadcast(roomId, ...args)
    }
  }

  join(socket) {
    this.broadcastFn("log", `${socket.ign} has joined the room.`)
  }

  leave(socket) {
    this.broadcastFn("log", `${socket.ign} has left the room.`)
  }
}

module.exports = GameService
