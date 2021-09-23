const GameService = require("./gameService.js")

const fs = require("fs")
const MS_TO_S = 1000
const NEXT_WORD_DELAY = 400

function shuffle(word) {
  const arr = Array.from(word)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[j]
    arr[j] = arr[i]
    arr[i] = temp
  }
  return arr.join("")
}

class AnagramService extends GameService {
  constructor(roomId) {
    super(roomId)
    const { players } = require("../gameManager.js")
    // players: id to { ign, score, round, startTime, time, submissions, strikes }
    this.initPlayers = () => {
      return players(roomId).reduce((acc, cur) => {
        acc[cur.ign] = {
          score: 0,
          round: 0,
          startTime: 0,
          time: this.settings.cipherTime,
          submissions: [],
          strikes: 0,
        }
        return acc
      }, {})
    }
    const file = fs.readFileSync("./server/assets/words.txt", "utf8")
    this.wordList = file.trim().split("\n")

    // TODO: update to get players on init (no need for getting state)
    // requests
    this.actions = {
      "anagram-init": this.init.bind(this),
      "anagram-submit": this.submit.bind(this),
    }

    // responses
    this.stateEvent = "anagram-start" // start the game (settings, players)
    this.resultEvent = "anagram-result" // result of submission (word or false)
    this.updatePlayerEvent = "anagram-update-player" // update score on screen
    this.endGameEvent = "anagram-end" // end the game
    this.cipherEvent = "anagram-cipher" // send the next scrambled phrase

    this.nextCipher = this.nextCipher.bind(this)
    this.generateCipher = this.generateCipher.bind(this)
    this.endGame = this.endGame.bind(this)
    this.wordTimeout = this.wordTimeout.bind(this)
    this.currentWord = this.currentWord.bind(this)
  }

  // socket.emit, socket.ign, socket.id
  // socket.emit(this.resultEvent, someData, arg2, arg3)

  init(settings) {
    /*
     * Game Mods (0 is infinite):
     * gameMode: string (coop) - coop (share score), sync (first to get it), rush (at your own pace)
     * showAnswer: boolean (false) - skip showing the answer after it's guessed
     * oneshot: boolean (false) - only 1 guess per cipher (per person)
     * strikes: num (0) - total number of misses before losing
     * ciphers: num (0) - total number of ciphers
     * cipherTime: num (DEFAULT_CIPHER_TIME) - base cipher time
     * timerType: string (decrease) - normal (default), adaptive (+/-), decrease (only -)
     * scoreLimit: num (0) - win game after score is reached (first to reach score wins)
     * timeLimit: num (DEFAULT_GAME_TIME) - ends game after time is elapsed (highest score wins)
     */
    this.settings = settings

    this.players = this.initPlayers()
    const players = Object.keys(this.players)
    this.numPlayers = players.length
    this.numAnswered = 0
    if (settings.gameMode === "coop") {
      players.unshift("coop")
      this.players.coop = {
        score: 0,
        round: 0,
        startTime: 0,
        time: settings.cipherTime,
        submissions: [],
        strikes: 0,
      }
    }
    this.showingAnswer = false

    this.broadcastFn(this.stateEvent, { players, settings })

    this.wordTimerId = -1
    // 3 second countdown
    this.gameTimerId = setTimeout(
      this.endGame,
      MS_TO_S * (parseInt(settings.timeLimit) + 3)
    )
    this.ciphers = []
    this.generateCipher()
    const newWord = this.ciphers[0]
    setTimeout(() => {
      this.wordTimerId = setTimeout(
        this.wordTimeout,
        settings.cipherTime * MS_TO_S
      )
      this.broadcastFn(
        this.cipherEvent,
        newWord[1],
        settings.cipherTime * MS_TO_S
      )
    }, 3000)
  }

  submit(message, socket) {
    if (!message || this.showingAnswer) {
      return
    }
    const player = this.players[socket.ign]
    const curRound =
      this.settings.gameMode === "coop" ? this.players.coop.round : player.round
    if (this.settings.oneshot && player.submissions.length >= curRound) {
      // player already submitted once
      return
    }
    while (player.submissions.length < curRound) {
      player.submissions.push("?")
    }
    player.submissions[curRound] = message
    if (
      this.settings.gameMode === "sync" ||
      this.settings.gameMode === "coop"
    ) {
      this.numAnswered++
      if (message === this.currentWord()) {
        clearTimeout(this.wordTimerId)
        this.players.coop.submissions.push(message)
        if (this.settings.gameMode === "coop") {
          this.players.coop.score++
          this.players.coop.round++
          this.broadcastFn(
            this.updatePlayerEvent,
            "coop",
            this.players.coop.score,
            this.players.coop.strikes
          )
        }
        this.players[socket.ign].score++
        this.broadcastFn(
          this.updatePlayerEvent,
          socket.ign,
          this.players[socket.ign].score,
          this.players[socket.ign].strikes
        )
        if (this.settings.showAnswer) {
          this.showingAnswer = true
          this.broadcastFn(this.resultEvent, message)
          setTimeout(this.nextCipher, NEXT_WORD_DELAY)
        } else {
          if (this.settings.oneshot && this.numAnswered === this.numPlayers) {
            this.wordTimeout()
          }
          this.nextCipher()
        }
      } else {
        socket.emit(this.resultEvent, false)
      }
    } else {
      if (message === this.currentWord) {
        socket.emit(this.resultEvent, true)
        this.scores[socket.id]++
        this.broadcastFn(
          this.updateScoreEvent,
          socket.id,
          this.scores[socket.id]
        )
        this.wordTimeout()
      } else {
        socket.emit(this.resultEvent, false)
      }
    }
  }

  nextCipher(id) {
    let newWord
    if (
      this.settings.gameMode !== "coop" &&
      this.players[id].round < this.ciphers.length
    ) {
      newWord = this.ciphers[this.players[id].round]
    } else {
      newWord = this.generateCipher()
    }
    this.numAnswered = 0
    if (this.settings.showAnswer) {
      setTimeout(() => {
        this.showingAnswer = false
        this.broadcastFn(
          this.cipherEvent,
          newWord[1],
          this.players.coop.time * MS_TO_S
        )
        this.wordTimerId = setTimeout(
          this.wordTimeout,
          this.players.coop.time * MS_TO_S
        )
      }, NEXT_WORD_DELAY)
    } else {
      this.broadcastFn(
        this.cipherEvent,
        newWord[1],
        this.players.coop.time * MS_TO_S
      )
      this.wordTimerId = setTimeout(
        this.wordTimeout,
        this.players.coop.time * MS_TO_S
      )
    }
  }

  generateCipher() {
    const word =
      this.wordList[Math.floor(Math.random() * this.wordList.length)].trim()
    const cipher = shuffle(word)
    this.ciphers.push([word, cipher])
    return [word, cipher]
  }

  currentWord(ign) {
    return this.settings.gameMode === "coop"
      ? this.ciphers[this.players.coop.round][0]
      : this.ciphers[this.players[ign].round][0]
  }

  endGame() {
    clearTimeout(this.gameTimerId)
    clearTimeout(this.wordTimerId)
    const results = Object.entries(this.players).reduce(
      (res, [userId, data]) => {
        res[userId] = {
          score: data.score,
          submissions: data.submissions,
        }
        return res
      },
      {}
    )
    this.broadcastFn(this.endGameEvent, {
      results,
      ciphers: this.ciphers,
    })
  }

  wordTimeout() {
    const current = this.currentWord()
    this.players.coop.submissions.push("?")
    this.players.coop.round++
    this.players.coop.strikes++
    this.broadcastFn(
      this.updatePlayerEvent,
      "coop",
      this.players.coop.score,
      this.players.coop.strikes
    )
    if (this.settings.showAnswer) {
      this.broadcastFn(this.resultEvent, current, true)
      setTimeout(this.nextCipher, NEXT_WORD_DELAY)
    } else {
      this.nextCipher()
    }
  }
}
AnagramService.prototype.id = "anagram"

module.exports = AnagramService
