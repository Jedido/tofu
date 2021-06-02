const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

// const Router = require('./router.js')
const GameManager = require('./gameManager.js')
const loggingMiddleware = require('./middleware/loggingMiddleware.js')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = 8638

const path = __dirname + '/../dist/'

app.use(express.static(path))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(loggingMiddleware)
app.get('/', function (_, res) {
  res.sendFile(`${path}index.html`)
})

const gameManager = new GameManager()
let userId = 0
io.on('connection', (socket) => {
  let r = null
  let g = null
  let gid = ''
  let id = `user ${userId++}`
  let ign = ''
  socket.on('create-room', (gameId, name) => {
    const res = gameManager.createRoom(gameId, socket)
    ign = name ? name : id
    r = res.roomId
    g = res.game
    gid = res.gameId
    socket.emit('set-room', r)
  })
  socket.on('join-room', (roomId, name) => {
    ign = name ? name : id
    g = gameManager.joinRoom(roomId, socket)
    r = roomId
    gid = Object.getPrototypeOf(g).id
    socket.emit('set-scene', gid)
  })
  socket.on('set-game', (gameId) => {
    gameManager.removeGame(r)
    g = gameManager.createGame(gameId)
  })
  socket.on('message', (msg) => {
    gameManager.broadcastEvent(r, 'message', `${ign ? ign : id}: ${msg}`)
  })
  socket.on('action', (type, data) => {
    // console.log(`${id} (${ign}) triggered ${type} on ${gid} (${r}): ${JSON.stringify(data)}`)
    g.actions[type](data, socket)
  })
  socket.on('disconnect', function () {
    console.log(`${id} (${ign}) has disconnected`)
  })
  console.log(`${id} connected`)
})

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
