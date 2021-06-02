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
    let roomId
    do {
      roomId = generateRoomId()
    } while (this.rooms[roomId])
    const game = new games[gameId]((type, ...params) => this.broadcast(roomId, type, ...params))
    this.rooms[roomId] = { game, log: [], sockets: [socket] }
    console.log(`created room with id ${roomId} and game ${gameId}`)
    return { roomId, game, gameId }
  }
  joinRoom(roomId, socket) {
    const room = this.rooms[roomId]
    room.sockets.push(socket)
    return room.game
  }
  removeGame(roomId) {
    delete this.rooms[roomId]
  }
  getRoomGame(roomId) {
    return this.rooms[roomId].game
  }
  broadcast(roomId, type, ...params) {
    // console.log(`emitting ${type} for all users in room ${roomId} (${this.rooms[roomId].sockets.length})`)
    this.rooms[roomId].sockets.forEach(socket => socket.emit(type, ...params))
  }
  broadcastAll() {
    // TODO: optional
  }
}

module.exports = GameManager
