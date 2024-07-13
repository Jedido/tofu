const fs = require("fs")

const GameService = require("./gameService.js")
const Trie = require("../utils/trie.js")

class SquaredleService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "squaredle-init": this.init.bind(this),
      "squaredle-submit": this.guess.bind(this),
      "squaredle-get": this.requestBoard.bind(this),
    }
    // responses
    this.boardEvent = "squaredle-board"
    this.revealWordEvent = "squaredle-reveal-word"
    this.bonusWordEvent = "squaredle-bonus-word"
    this.guessResponseEvent = "squaredle-guess-response"

    const wordList = fs.readFileSync("./server/assets/squaredle_words.txt", "utf8")
    this.words = wordList.trim().split("\n")
    this.wordTrie = new Trie()
    this.words.forEach(word => {
      this.wordTrie.insert(word)
    })
    const dictionary = fs.readFileSync("./server/assets/zyzzyva.txt", "utf8")
    this.dictionary = dictionary.trim().split("\n")
    const letterFrequency = fs.readFileSync("./server/assets/letter_frequency.csv", "utf8")
    this.letterSampler = []
    this.totalLetterFrequency = 0
    letterFrequency.trim().split("\n").forEach((line) => {
      const [letter, frequecy] = line.split(",")
      this.totalLetterFrequency += Number(frequecy)
      this.letterSampler.push([letter, this.totalLetterFrequency])
    })

    // game state
    this.size = 0
    this.revealed = new Set()
    this.answers = new Map()
    this.submissions = {}
    this.gameStatus = "menu"
  }

  init({ size }, socket) {
    if (size <= 2) {
      return
    }
    this.size = size
    const minLargest = Math.min(size * size / 2, 10)
    const startingWords = this.words.filter((word) => word.length > minLargest && word.length < size * size)

    this.revealed = new Set()
    this.bonusWords = new Set()
    do {
      this.board = []
      this.instanceCount = []
      this.startingCount = []
      this.answers = new Map()
      for (let i = 0; i < size; i++) {
        this.board[i] = []
        this.instanceCount[i] = []
        this.startingCount[i] = []
        for (let j = 0; j < size; j++) {
          this.instanceCount[i][j] = 0
          this.startingCount[i][j] = 0
        }
      }
      const startingWord = startingWords[Math.floor(Math.random() * startingWords.length)]
      const ox = Math.floor(Math.random() * size)
      const oy = Math.floor(Math.random() * size)
      const path = this.findPath(ox, oy, startingWord.length, [])
      for (let i = 0; i < startingWord.length; i++) {
        const c = path[i]
        const nextLetter = startingWord.charAt(i)
        this.board[c[0]][c[1]] = nextLetter
      }

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!this.board[i][j]) {
            this.board[i][j] = this.getRandomLetter()
          }
        }
      }
    } while (!this.solve() || Array.from(this.answers.keys()).length > size * size * size);
    const answer = Array.from(this.answers.keys())
    answer.sort()
    console.log(JSON.stringify(answer))
    this.gameStatus = "ongoing"
    this.broadcastFn(this.boardEvent, this.getState())
  }

  getAdjacents([ox, oy]) {
    return [[1, 1], [0, 1], [-1, 1], [1, 0], [-1, 0], [1, -1], [0, -1], [-1, -1]].filter(([nx, ny]) => {
      const x = ox + nx
      const y = oy + ny
      return x >= 0 && x < this.size && y >= 0 && y < this.size
    })
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[j]
      arr[j] = arr[i]
      arr[i] = temp
    }
  }

  findPath(x, y, k, path) {
    if (path.length === k) {
      return path
    }
    const validMoves = this.getAdjacents([x, y])
    this.shuffle(validMoves)

    for (const [dx, dy] of validMoves) {
      const nx = x + dx
      const ny = y + dy
      if (path.find(([i, j]) => i === nx && j === ny)) {
        continue
      }
      path.push([nx, ny])

      const foundPath = this.findPath(nx, ny, k, path)
      if (foundPath.length === k) {
        return foundPath
      }

      path.pop()
    }

    return []
  }

  traverse(x, y, path, trieNode) {
    if (!!trieNode.word && !this.answers.has(trieNode.word)) {
      // add as word
      this.answers.set(trieNode.word, path.slice())
      const head = path[0]
      this.startingCount[head[0]][head[1]]++
      for (const [fx, fy] of path) {
        this.instanceCount[fx][fy]++
      }
    }
    const validMoves = this.getAdjacents([x, y])
    this.shuffle(validMoves)
    for (const [dx, dy] of validMoves) {
      const nx = x + dx
      const ny = y + dy
      const char = this.board[nx][ny]
      if (path.find(([i, j]) => i === nx && j === ny) || !trieNode.children[char]) {
        continue
      }
      path.push([nx, ny])
      this.traverse(nx, ny, path, trieNode.children[char])
      path.pop()
    }
  }

  solve() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.traverse(i, j, [], this.wordTrie.root)
      }
    }
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.instanceCount[i][j] === 0) {
          return false
        }
      }
    }
    return true
  }

  getRandomLetter() {
    const sample = Math.random() * this.totalLetterFrequency
    for (let i = 0; i < this.letterSampler.length; i++) {
      const [letter, cumulativeFrequency] = this.letterSampler[i]
      if (sample < cumulativeFrequency) {
        return letter
      }
    }
  }

  guess(word, socket) {
    word = word.toUpperCase()
    if (this.revealed.has(word)) {
      // already found this word, maybe the user is behind?
      socket.emit(this.boardEvent, this.getState())
      return
    }
    if (this.answers.has(word)) {
      const letters = this.answers.get(word)
      this.startingCount[letters[0][0]][letters[0][1]]--
      for (let [x, y] of letters) {
        this.instanceCount[x][y]--
      }
      this.revealed.add(word)
      this.broadcastFn(this.revealWordEvent, word)
      this.broadcastFn("log", `${socket.ign} found a word: ${word}`)
      socket.emit(this.guessResponseEvent, word, "valid")
    } else if (this.dictionary.includes(word)) {
      socket.emit(this.guessResponseEvent, word, "bonus")
      this.broadcastFn("log", `${socket.ign} found a bonus word: ${word}`)
      this.broadcastFn(this.bonusWordEvent, word)
    } else {
      socket.emit(this.guessResponseEvent, word, "invalid")
    }
  }

  requestBoard(_, socket) {
    if (this.gameStatus !== "menu") {
      socket.emit(this.boardEvent, this.getState())
    }
  }

  getState() {
    const boardInfo = []
    for (let x = 0; x < this.size; x++) {
      boardInfo[x] = []
      for (let y = 0; y < this.size; y++) {
        boardInfo[x][y] = {
          letter: this.board[x][y],
          instances: this.instanceCount[x][y],
          starts: this.startingCount[x][y]
        }
      }
    }
    return {
      board: boardInfo,
      foundWords: Array.from(this.revealed),
      allWords: Object.fromEntries(this.answers)
    }
  }
}
SquaredleService.prototype.id = "squaredle"

module.exports = SquaredleService
