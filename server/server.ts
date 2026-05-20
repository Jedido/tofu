import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import http from "http"
import { join } from "path"

import { initGameManager } from "./gameManager.ts"
import { initDatabaseManager } from "./databaseManager.ts"
import loggingMiddleware from "./middleware/loggingMiddleware.ts"

const app = express()
const server = http.createServer(app)
let port = 3001
let isProd = false
process.argv.forEach(function (val) {
  if (val === "prod") {
    port = 8638
    isProd = true
  }
})

app.use(bodyParser.json())
app.use(cors())
app.use(loggingMiddleware)
app.use(express.urlencoded({ extended: true }))

if (isProd) {
  const distPath = join(import.meta.dirname, "/../dist/index.html")
  app.use(express.static(join(import.meta.dirname, "/../dist/")))
  app.get("/:room", function (_, res) {
    res.sendFile(distPath)
  })
}

// Game Socket Handling
initGameManager(server)
initDatabaseManager()

// listen on the port
server.listen(port)
console.log(`App is listening on port ${port}`)
