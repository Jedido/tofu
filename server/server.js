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
const port = 8080

const path = __dirname + '/../dist/'

app.use(express.static(path))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(loggingMiddleware)
app.get('/', function (_, res) {
  res.sendFile(`${path}index.html`)
})

// const router = new Router([new AnagramService(), new MinesweeperService()])
// router.apply(app)

const gameManager = new GameManager()
let userId = 0
io.on('connection', (socket) => {
  let r = null
  let g = null
  let id = `user ${userId++}`
  let ign = ''
  socket.on('create-room', (gameId, name) => {
    const res = gameManager.addGame(gameId)
    ign = name
    r = res.roomId
    g = res.game
  })
  socket.on('join-game', (roomId, name) => {
    ign = name
    g = gameManager.joinGame(roomId)
    r = roomId
  })
  socket.on('set-game', (gameId) => {
    gameManager.removeGame(r)
    g = gameManager.createGame(gameId)
  })
  socket.on('action', (data) => {
    console.log(`${id} (${ign}) made action on ${g}: `)
    console.log(data)
    // g.performAction(data)
  })
  socket.on('get-info', () => {
    socket.send('state', { gameId: gameManager.getRoomGame(r).id, r })
  })
  socket.on('disconnect', function () {
    console.log(`${id} (${ign}) has disconnected`)
  })
  console.log(`${id} connected`)
})

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
