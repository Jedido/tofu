const AnagramService = require('./services/anagramService.js')
const MinesweeperService = require('./services/minesweeperService.js')

const roomIdLength = 5
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const charactersLength = characters.length
function generateRoomId() {
  const result = []
  for (let i = 0; i < roomIdLength; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
  }
  return result.join('')
}

const games = [MinesweeperService, AnagramService].reduce(
  (acc, cur) => { acc[cur.prototype.id] = cur; return acc }, {}
)


class GameManager {
  constructor() {
    this.rooms = {}
  }
  createRoom(gameId, socket) {
    if (!gameId || !games[gameId]) {
      return
    }
    let roomId
    do {
      roomId = generateRoomId()
    } while (this.rooms[roomId])
    const game = new games[gameId]((type, ...params) => this.broadcast(roomId, type, ...params))
    const sockets = new Set()
    sockets.add(socket)
    this.rooms[roomId] = { game, log: [], sockets }
    console.log(`created room with id ${roomId} and game ${gameId}`)
    return { roomId, game, gameId }
  }
  joinRoom(roomId, socket) {
    if (!this.hasRoom(roomId)) {
      return
    }
    const room = this.rooms[roomId]
    room.sockets.add(socket)
    return room.game
  }
  leaveRoom(roomId, socket) {
    if (!this.hasRoom(roomId)) {
      return
    }
    const sockets = this.rooms[roomId].sockets
    sockets.delete(socket)
    if (sockets.size === 0) {
      this.removeGame(roomId)
    }
  }
  removeGame(roomId) {
    if (!this.hasRoom(roomId)) {
      return
    }
    console.log(`deleting room ${roomId} since all players have left`)
    delete this.rooms[roomId]
  }
  broadcast(roomId, type, ...params) {
    if (!this.hasRoom(roomId)) {
      return
    }
    // console.log(`emitting ${type} for all users in room ${roomId} (${this.rooms[roomId].sockets.length})`)
    this.rooms[roomId].sockets.forEach(socket => socket.emit(type, ...params))
  }
  broadcastAll() {
    // TODO: optional
  }
  hasRoom(roomId) {
    return roomId && this.rooms[roomId]
  }
}

module.exports = GameManager
