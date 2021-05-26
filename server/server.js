const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 8080
const Router = require('./router.js')
const AnagramService = require('./services/anagramService.js')

const path = __dirname + '/../dist/'

app.use(express.static(path))
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  console.log(req.url)
  next()
})
const router = new Router([new AnagramService()])
router.apply(app)

app.get('/', function (req, res) {
  res.sendFile(`${path}index.html`)
})

// listen on the port
app.listen(port)
console.log(`App is listening on port ${port}`)
