const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const http = require("http")

const { initGameManager } = require("./gameManager.js")
const { initDatabaseManager } = require("./databaseManager.ts")
const loggingMiddleware = require("./middleware/loggingMiddleware.js")

const app = express()
const server = http.createServer(app)
let port = 8080
process.argv.forEach(function (val) {
  if (val === "prod") {
    port = 8638
  }
})

const path = require('path').join(__dirname, "/../dist/index.html")

// Site Request Handling
app.use(express.static(__dirname + "/../dist/"))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(loggingMiddleware)
app.get("/:room", function (_, res) {
  res.sendFile(path);
})

// Game Socket Handling
initGameManager(server)
// initDatabaseManager()

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
