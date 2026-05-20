import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import http from "http"
import { join } from "path"

import { initGameManager } from "./gameManager.js"
import { initDatabaseManager } from "./databaseManager.ts"
import loggingMiddleware from "./middleware/loggingMiddleware.js"

const app = express()
const server = http.createServer(app)
let port = 3001
process.argv.forEach(function (val) {
  if (val === "prod") {
    port = 8638
  }
})

const path = join(import.meta.dirname, "/../dist/index.html")

// Site Request Handling
app.use(express.static(import.meta.dirname + "/../dist/"))
app.use(bodyParser.json())
app.use(cors())
app.use(loggingMiddleware)
app.use(express.urlencoded({ extended: true }))
app.get("/:room", function (_, res) {
  res.sendFile(path);
})

// Game Socket Handling
initGameManager(server)
initDatabaseManager()

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
