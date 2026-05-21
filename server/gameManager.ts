import { Server } from "socket.io"
import { Server as HttpServer } from "http"

import { games } from "./registry.ts"

import { TSocket } from "./utils/tsocket.ts"
import { randomItem } from "./utils/util.ts"

import type GameService from "./services/gameService.ts"

const users = new Map<string, TSocket>()

interface GameRoom {
  game: GameService
  gameId: string
}

const gameRooms: Record<string, GameRoom> = {}
let io: Server

const wordList = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliet",
  "kilo",
  "lima",
  "mike",
  "november",
  "oscar",
  "papa",
  "quebec",
  "romeo",
  "sierra",
  "tango",
  "uniform",
  "victor",
  "whiskey",
  "xray",
  "yankee",
  "zulu",
  "panda",
  "dragon",
  "eagle",
  "tiger",
  "lion",
  "bear",
  "shark",
  "wolf",
  "elephant",
  "giraffe",
  "monkey",
  "zebra",
  "horse",
  "cat",
]

function initGameManager(server: HttpServer) {
  io = new Server(server)
  io.on("connection", (socket) => {
    const num = `${Math.floor(Math.random() * 100)}`.padStart(2, "0")
    const user = new TSocket(
      socket,
      `${randomItem(wordList)}-${randomItem(wordList)}-${num}`
    )
    users.set(socket.id, user)
    socket.on("create-room", (gameId: string) => {
      createRoom(gameId, user)
    })
    socket.on("join-room", (roomId: string) => {
      joinRoom(roomId.toUpperCase(), user)
    })
    socket.on("leave-room", () => {
      leaveRoom(user.roomId, user)
    })
    socket.on("set-ign", (ign: string) => {
      console.log(`${user.id} (${user.ign}) has changed their name to ${ign}`)
      const oldIgn = user.ign
      user.ign = ign
      socket.emit("set-user", user.details())
      broadcast(
        user.roomId,
        "log",
        `${oldIgn} has changed their name to ${ign}`
      )
    })
    socket.on(
      "restore-user",
      ({ id, ign, iv }: { id: string; ign: string; iv?: string }) => {
        try {
          user.ign = ign
          user.id = id
          // user.id = decrypt(id, iv)
          socket.emit("set-user", user.details())
        } catch (e) {
          console.log(`${user.ign} failed to execute restore-user: ${e}`)
          console.log((e as Error).stack)
          socket.emit("set-user", user.details())
        }
      }
    )
    socket.on("create-user", () => {
      console.log(`New user ${user.id}`)
      socket.emit("set-user", user.details())
    })
    socket.on("send-message", (msg: string) => {
      if (!hasRoom(user.roomId)) {
        console.log(`Unknown room ${user.roomId}`)
        return
      } else {
        broadcast(user.roomId, "log-message", { ign: user.ign, msg })
      }
    })
    socket.on("action", (type: string, data: unknown) => {
      try {
        if (!hasRoom(user.roomId)) {
          console.log(`Unknown room ${user.roomId}`)
          return
        }
        console.log({
          cat: "socket",
          type,
          user: { ign: user.ign, id: user.id },
          game: gameRooms[user.roomId].gameId,
          room: user.roomId,
          data,
        })
        gameRooms[user.roomId].game.dispatch(type, data, user)
      } catch (e) {
        console.log(`${user.ign} failed to execute ${type}: ${e}`)
        console.log((e as Error).stack)
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
      leaveRoom(roomId, user)
      users.delete(user.socket.id)
    })
  })
}

const roomIdLength = 5
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const charactersLength = characters.length
function createRoom(gameId: string, socket: TSocket) {
  if (!gameId || !games[gameId]) {
    console.log(`${socket.id} failed to load game ${gameId}`)
    return
  }
  let roomId: string
  do {
    const result: string[] = []
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
function joinRoom(roomId: string, socket: TSocket) {
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
function leaveRoom(roomId: string, socket: TSocket) {
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
function hasRoom(roomId: string): boolean {
  return !!(roomId && gameRooms[roomId])
}
function removeGame(roomId: string) {
  if (!hasRoom(roomId)) {
    return
  }
  console.log(`deleting room ${roomId} since all players have left`)
  try {
    const gameRoom = gameRooms[roomId].game
    gameRoom.shutdown()
    delete gameRooms[roomId]
  } catch (e) {
    console.log((e as Error).stack)
  }
}
function broadcast(roomId: string, type: string, ...params: unknown[]) {
  if (!hasRoom(roomId)) {
    return
  }
  io.to(roomId).emit(type, ...params)
}
function players(roomId: string): TSocket[] {
  if (!hasRoom(roomId)) {
    return []
  }
  const res: TSocket[] = []
  io.sockets.adapter.rooms.get(roomId)!.forEach((id) => {
    const socket = users.get(id)
    if (socket) {
      res.push(socket)
    }
  })
  return res
}

export { initGameManager, broadcast, players }
