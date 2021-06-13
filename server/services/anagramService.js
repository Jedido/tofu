const fs = require("fs")

class AnagramService {
  constructor(broadcastFn) {
    this.broadcastFn = broadcastFn

    this.ONE_SECOND = 1000
    this.scores = {} // competitive, uid to score
    this.score = 0 // co-op, cumulative score
    this.wordList = []
    this.words = []
    this.currentWord = ""
    this.coop = true
    this.gameTimerId = -1
    this.wordTimerId = -1
    this.roundNum = 0

    // requests
    this.actions = {
      "anagram-init": this.init.bind(this),
      "anagram-get-state": this.getState.bind(this),
      "anagram-submit": this.submit.bind(this),
    }

    // responses
    this.resultEvent = "anagram-result" // result of submission
    this.updateScoreEvent = "anagram-update-score" // update score on screen
    this.endGameEvent = "anagram-end" // end the game
    this.stateEvent = "anagram-state" // get the current state of the game
    this.cipherEvent = "anagram-cipher" // send the next scrambled phrase

    this.getNewWord = this.getNewWord.bind(this)
    this.gameTimer = this.gameTimer.bind(this)
    this.wordTimer = this.wordTimer.bind(this)
  }

  // socket.emit, socket.ign, socket.id
  // socket.emit(this.resultEvent, someData, arg2, arg3)

  init(message) {
    this.roundNum = 0
    this.score = 0
    this.scores = {}
    this.currentWord = ""
    this.coop = message.coop
    let file = fs.readFileSync("./server/assets/words.txt", "utf8")
    this.wordList = file.trim().split("\n")
    this.gameTimerId = setTimeout(this.gameTimer, this.ONE_SECOND * 60)
    let newWord = this.getNewWord()
    this.broadcastFn(this.stateEvent, {
      cipher: newWord[1],
      gameMode: this.coop,
      roundNum: this.roundNum,
      scores: this.scores,
      score: this.score,
    })
    this.broadcastFn(this.cipherEvent, newWord[1], newWord[2])
  }

  getState() {
    this.broadcastFn(this.stateEvent, {
      cipher: this.words[this.words.length - 1][1],
      gameMode: this.coop,
      roundNum: this.roundNum,
      scores: this.scores,
      score: this.score,
    })
  }

  submit(message, socket) {
    if (this.coop) {
      if (message === this.currentWord) {
        // socket.emit(this.resultEvent, true)
        this.score++
        this.broadcastFn(this.updateScoreEvent, this.score)
        this.wordTimer()
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
        this.wordTimer()
      } else {
        socket.emit(this.resultEvent, false)
      }
    }
  }

  getNewWord() {
    let word =
      this.wordList[Math.floor(Math.random() * this.wordList.length)].trim()
    this.currentWord = word
    let arr = Array.from(word)
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1))
      let temp = arr[j]
      arr[j] = arr[i]
      arr[i] = temp
    }
    const cipher = arr.join("")
    this.words.push([word, cipher])
    this.roundNum++
    let time = Math.max(
      this.ONE_SECOND * (10 - 0.5 * this.roundNum),
      this.ONE_SECOND * 3
    )
    this.wordTimerId = setTimeout(this.wordTimer, time)
    return [word, cipher, time]
  }

  gameTimer() {
    clearTimeout(this.gameTimerId)
    this.broadcastFn(this.endGameEvent, this.score, this.scores)
  }

  wordTimer() {
    clearTimeout(this.wordTimerId)
    let newWord = this.getNewWord()
    this.broadcastFn(this.cipherEvent, newWord[1], newWord[2])
  }
}
AnagramService.prototype.id = "anagram"

module.exports = AnagramService
