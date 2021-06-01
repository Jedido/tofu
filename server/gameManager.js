class GameManager {
  constructor() {
    this.rooms = {}
  }
  addGame(gameId) {
    let roomId
    do {
      roomId = generateRoomId()
    } while (this.rooms[roomId])
    const game = createGame(gameId)
    this.rooms[roomId] = game
    console.log(`created room with id ${roomId} and game ${gameId}`)
    return { roomId, game }
  }
  removeGame(roomId) {
    delete this.rooms[roomId]
  }
  getRoomGame(roomId) {
    return this.rooms[roomId].name()
  }
}

const AnagramService = require('./services/anagramService.js')
const MinesweeperService = require('./services/minesweeperService.js')

const roomIdLength = 5
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const charactersLength = characters.length
function generateRoomId() {
  const result = []
  for (let i = 0; i < roomIdLength; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
  }
  return result.join('')
}

const games = [MinesweeperService, AnagramService].reduce(
  (acc, cur) => { acc[cur.id] = cur; return acc }, {}
)
function createGame(gameId) {
  return games[gameId]()
}

module.exports = GameManager