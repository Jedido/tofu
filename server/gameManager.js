const dotenv = require('dotenv')
const { Server } = require("socket.io")

const ExampleService = require("./services/exampleService.js")
const AnagramService = require("./services/anagramService.js")
const MinesweeperService = require("./services/minesweeperService.js")
const GachaService = require("./services/gachaService.js")
const WatchService = require("./services/watchService.js")
const JeopardyService = require("./services/jeopardyService.js")
const SquaredleService = require("./services/squaredleService.js")
const SandboxService = require("./services/sandboxService.js")

dotenv.config({ path: `.env.local` })
dotenv.config()

const games = [
  MinesweeperService,
  AnagramService,
  ExampleService,
  GachaService,
  WatchService,
  JeopardyService,
  SquaredleService,
  SandboxService,
].reduce((acc, cur) => {
  acc[cur.prototype.id] = cur
  return acc
}, {})
const gameRooms = {}
let io

let username = 0
function initGameManager(server) {
  io = new Server(server)
  io.on("connection", (socket) => {
    socket.ign = `user ${username++}`
    socket.on("create-room", (gameId) => {
      createRoom(gameId, socket)
    })
    socket.on("join-room", (roomId) => {
      joinRoom(roomId.toUpperCase(), socket)
    })
    socket.on("leave-room", () => {
      leaveRoom(socket.roomId, socket)
    })
    socket.on("set-ign", (ign) => {
      console.log(`${socket.id} (${socket.ign}) has changed their name to ${ign}`)
      const oldIgn = socket.ign
      socket.ign = ign
      socket.emit("set-user", socket.ign, socket.id)
      broadcast(socket.roomId, "log", `${oldIgn} has changed their name to ${ign}`)
    })
    socket.on("send-message", (msg) => {
      if (!hasRoom(socket.roomId)) {
        console.log(`Unknown room ${socket.roomId}`)
        return
      } else {
        broadcast(socket.roomId, "log-message", { ign: socket.ign, msg })
      }
    })
    socket.on("action", (type, data) => {
      try {
        if (!hasRoom(socket.roomId)) {
          console.log(`Unknown room ${socket.roomId}`)
          return
        }
        const actionFn = gameRooms[socket.roomId].game.actions[type]
        if (!actionFn) {
          console.log(
            `${socket.ign} triggered unknown event: ${type} (${JSON.stringify(
              data
            )})`
          )
        } else {
          // logging
          console.log(
            `${socket.id} (${socket.ign}) triggered ${type} on ${
              gameRooms[socket.roomId].gameId
            } (${socket.roomId}): ${JSON.stringify(data)}`
          )
          actionFn(data, socket)
        }
      } catch (e) {
        console.log(`${socket.ign} failed to execute: ${e}`)
        console.log(e.stack)
      }
    })
    socket.on("disconnect", function () {
      const roomId = socket.roomId
      console.log(`Lost connection to ${socket.id} (${socket.ign})`)
      if (roomId && !io.sockets.adapter.rooms.get(roomId)) {
        removeGame(roomId)
      }
      leaveRoom(roomId, socket)
    })
    socket.emit("set-user", socket.ign, socket.id)
    console.log(`${socket.id} has connected`)
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
  socket.roomId = roomId
  socket.emit("set-room", roomId)
  socket.emit("set-scene", gameId)
  socket.join(roomId)
  console.log(`${socket.ign} joined room ${roomId}: ${gameId}`)
  broadcast(roomId, "log", `${socket.ign} has joined the room.`)
}
function leaveRoom(roomId, socket) {
  if (!hasRoom(roomId)) {
    return
  }
  socket.leave(roomId)
  broadcast(roomId, "log", `${socket.ign} has left the room.`)
  if (!io.sockets.adapter.rooms.get(roomId)) {
    removeGame(roomId)
  } else {
    const onDisconnect = gameRooms[roomId].game.actions["disconnect"]
    if (onDisconnect) {
      onDisconnect(socket)
    }
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
  delete gameRooms[roomId]
  // TODO deactivate game somehow
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
    const socket = io.sockets.adapter.nsp.sockets.get(id)
    res.push({
      id,
      ign: socket.ign,
    })
  })
  return res
}
module.exports = {
  initGameManager,
  broadcast,
  players,
}
