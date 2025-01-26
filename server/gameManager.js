const dotenv = require('dotenv')
const { Server } = require("socket.io")

const ExampleService = require("./services/exampleService.js")
const AnagramService = require("./services/anagramService.js")
const MinesweeperService = require("./services/minesweeperService.js")
const GachaService = require("./services/gachaService.js")
const WatchService = require("./services/watchService.js")
const JeopardyService = require("./services/jeopardyService.js")
const SquaredleService = require("./services/squaredleService.js")
const TeamService = require("./services/team/teamService.ts")
const SandboxService = require("./services/sandboxService.js")

const { TSocket } = require("./utils/tsocket.ts")
const { decrypt } = require("./utils/cipher.ts")
const { randomItem } = require("./utils/util.js")

dotenv.config({ path: `.env.local` })
dotenv.config()

const users = new Map()

const games = [
  MinesweeperService,
  AnagramService,
  ExampleService,
  GachaService,
  WatchService,
  JeopardyService,
  SquaredleService,
  TeamService,
  SandboxService,
].reduce((acc, cur) => {
  acc[cur.prototype.id] = cur
  return acc
}, {})
const gameRooms = {}
let io

const wordList = [
  'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 
  'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango',
  'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'panda', 'dragon', 'eagle', 'tiger',
  'lion', 'bear', 'shark', 'wolf', 'elephant', 'giraffe', 'monkey', 'zebra', 'horse', 'cat'
]

function initGameManager(server) {
  io = new Server(server)
  io.on("connection", (socket) => {
    const num = `${Math.floor(Math.random() * 100)}`.padStart(2, '0')
    const user = new TSocket(socket, `${randomItem(wordList)}-${randomItem(wordList)}-${num}`)
    users.set(socket.id, user)
    socket.on("create-room", (gameId) => {
      createRoom(gameId, user)
    })
    socket.on("join-room", (roomId) => {
      joinRoom(roomId.toUpperCase(), user)
    })
    socket.on("leave-room", () => {
      leaveRoom(user.roomId, user)
    })
    socket.on("set-ign", (ign) => {
      console.log(`${user.id} (${user.ign}) has changed their name to ${ign}`)
      const oldIgn = user.ign
      user.ign = ign
      socket.emit("set-user", user.details())
      broadcast(user.socket.roomId, "log", `${oldIgn} has changed their name to ${ign}`)
    })
    socket.on("restore-user", ({ id, ign, iv }) => {
      try {
        user.ign = ign
        user.id = decrypt(id, iv)
        console.log(`Returning user ${user.id} (${user.ign})`)
        socket.emit("set-user", user.details())
      } catch (e) {
        console.log(`${user.ign} failed to execute: ${e}`)
        console.log(e.stack)
        console.log("creating a new user instead")
        socket.emit("set-user", user.details())
      }
    })
    socket.on("create-user", () => {
      console.log(`New user ${user.id}`)
      socket.emit("set-user", user.details())
    })
    socket.on("send-message", (msg) => {
      if (!hasRoom(user.roomId)) {
        console.log(`Unknown room ${user.roomId}`)
        return
      } else {
        broadcast(user.roomId, "log-message", { ign: user.ign, msg })
      }
    })
    socket.on("action", (type, data) => {
      try {
        if (!hasRoom(user.roomId)) {
          console.log(`Unknown room ${user.roomId}`)
          return
        }
        const actionFn = gameRooms[user.roomId].game.actions[type]
        if (!actionFn) {
          console.log(
            `${user.ign} (${user.id}) triggered unknown event: ${type} (${JSON.stringify(
              data
            )})`
          )
        } else {
          // logging
          console.log(
            `${user.ign} (${user.id}) triggered ${type} on ${
              gameRooms[user.roomId].gameId
            } (${user.roomId}): ${JSON.stringify(data).substring(0, 200)}`
          )
          actionFn(data, user)
        }
      } catch (e) {
        console.log(`${user.ign} failed to execute: ${e}`)
        console.log(e.stack)
      }
    })
    socket.on("disconnect", () => {
      const roomId = user.roomId
      console.log(`Lost connection to ${user.id} (${user.ign})`)
      setTimeout(() => {
        if (roomId && !io.sockets.adapter.rooms.get(roomId)) {
          removeGame(roomId)
        }
      }, 30000)
      leaveRoom(roomId, socket)
      users.delete(user.socket.id)
  })
  })
}

const roomIdLength = 5
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const charactersLength = characters.length
function createRoom(gameId, socket) {
  if (!gameId || !games[gameId]) {
    console.log(`${socket.id} failed to load game ${gameId}`)
    return
  }
  let roomId
  do {
    const result = []
    for (let i = 0; i < roomIdLength; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      )
    }
    roomId = result.join("")
  } while (gameRooms[roomId])
  const game = new games[gameId](roomId)
  gameRooms[roomId] = { game, gameId }
  console.log(`created room with id ${roomId} and game ${gameId}`)
  joinRoom(roomId, socket)
}
function joinRoom(roomId, socket) {
  if (!hasRoom(roomId)) {
    socket.emit("set-room", "")
    socket.emit("set-scene", "select")
    return
  }
  const gameId = gameRooms[roomId].gameId
  socket.emit("set-room", roomId)
  socket.emit("set-scene", gameId)
  socket.join(roomId)
  console.log(`${socket.ign} joined room ${roomId}: ${gameId}`)
  broadcast(roomId, "log", `${socket.ign} has joined the room.`)
  gameRooms[roomId].game.join(socket)
}
function leaveRoom(roomId, socket) {
  if (!hasRoom(roomId)) {
    return
  }
  socket.leave()
  if (!io.sockets.adapter.rooms.get(roomId)) {
    removeGame(roomId)
  } else {
    gameRooms[roomId].game.leave(socket)
  }
}
function hasRoom(roomId) {
  return roomId && gameRooms[roomId]
}
function removeGame(roomId) {
  if (!hasRoom(roomId)) {
    return
  }
  console.log(`deleting room ${roomId} since all players have left`)
  const onShutdown = gameRooms[roomId].game.actions["shutdown"]
  if (onShutdown) {
    onShutdown()
  }
  delete gameRooms[roomId]
  // TODO deactivate game somehow - shutdown function?
}
function broadcast(roomId, type, ...params) {
  if (!hasRoom(roomId)) {
    return
  }
  io.to(roomId).emit(type, ...params)
}
function players(roomId) {
  if (!hasRoom(roomId)) {
    return
  }
  const res = []
  io.sockets.adapter.rooms.get(roomId).forEach((id) => {
    const socket = users.get(id)
    res.push(socket)
  })
  return res
}
module.exports = {
  initGameManager,
  broadcast,
  players,
}
