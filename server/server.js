const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")

const GameManager = require("./gameManager.js")
const loggingMiddleware = require("./middleware/loggingMiddleware.js")

const app = express()
const server = http.createServer(app)
const io = new Server(server)
let port = 8080
process.argv.forEach(function (val) {
  if (val === "prod") {
    port = 8638
  }
})

const path = __dirname + "/../dist/"

// Site Request Handling
app.use(express.static(path))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(loggingMiddleware)
app.get("/", function (_, res) {
  res.sendFile(`${path}index.html`)
})
app.get("/:room", function (_, res) {
  res.sendFile(`${path}index.html`)
})

// Game Socket Handling
const gameManager = new GameManager()
let userId = 0
io.on("connection", (socket) => {
  let r = null
  let g = null
  let gid = ""
  socket.id = `user ${userId++}`
  socket.on("create-room", (gameId, name) => {
    const res = gameManager.createRoom(gameId, socket)
    socket.ign = name ? name : socket.id
    r = res.roomId
    g = res.game
    gid = res.gameId
    socket.emit("set-room", r)
  })
  socket.on("join-room", (roomId, name) => {
    socket.ign = name ? name : socket.id
    g = gameManager.joinRoom(roomId, socket)
    if (g) {
      r = roomId
      gid = Object.getPrototypeOf(g).id
      socket.emit("set-scene", gid)
    }
  })
  socket.on("leave-room", () => {
    gameManager.broadcast(r, "message", `${socket.ign} has left the room.`)
    g = gameManager.leaveRoom(r, socket)
    r = null
    g = null
    gid = ""
    socket.emit("set-scene", "select")
  })
  socket.on("set-game", (gameId) => {
    gameManager.removeGame(r)
    g = gameManager.createGame(gameId)
  })
  socket.on("set-ign", (ign) => {
    if (ign.search("user") === -1) {
      gameManager.broadcast(
        r,
        "log",
        `${socket.ign} has changed their name to ${ign}`
      )
      socket.ign = ign
    }
  })
  socket.on("message", (msg) => {
    gameManager.broadcast(r, "log", `${socket.ign}: ${msg}`)
  })
  socket.on("action", (type, data) => {
    // console.log(`${id} (${ign}) triggered ${type} on ${gid} (${r}): ${JSON.stringify(data)}`)
    try {
      const actionFn = g.actions[type]
      if (!actionFn) {
        console.log(
          `${socket.id} (${
            socket.ign
          }) triggered unknown event: ${type} (${JSON.stringify(data)})`
        )
      } else {
        g.actions[type](data, socket)
      }
    } catch (e) {
      console.log(`${socket.id} (${socket.ign} failed to execute: ${e}`)
    }
  })
  socket.on("disconnect", function () {
    console.log(`${socket.id} (${socket.ign}) has disconnected`)
    gameManager.leaveRoom(r, socket)
  })
  socket.emit("set-user", socket.id, socket.id)
  console.log(`${socket.id} has connected`)
})

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
