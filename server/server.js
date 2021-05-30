// const http = require('http')
// const WebSocketServer = require('ws').Server
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const Router = require('./router.js')
const AnagramService = require('./services/anagramService.js')
const MinesweeperService = require('./services/minesweeperService.js')
const loggingMiddleware = require('./middleware/loggingMiddleware.js')

const app = express()
const port = 8080

const path = __dirname + '/../dist/'

app.use(express.static(path))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(loggingMiddleware)
app.get('/', function (req, res) {
  res.sendFile(`${path}index.html`)
})

// function getService(name) {
//     switch(name) {
//         case 'anagram': return new AnagramService()
//         case 'minesweeper': return new MinesweeperService()
//     }
//     return null
// }
// app.post('/game/create', (req, res) => {
//     const { code, game } = req.body
//     const server = http.createServer(app)
//     const wss = new WebSocketServer({server: server, path: `/connect/${code}` })
//     const service = getService(game)
//     wss.on('connection', service.functions)
//     this.sockets.add(wss)
//     res.send('success')
// })
const router = new Router([new AnagramService(), new MinesweeperService()])
router.apply(app)

// listen on the port
app.listen(port)
console.log(`App is listening on port ${port}`)
