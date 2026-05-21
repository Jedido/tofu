import fs from "fs"
import {
  SquaredleServiceBase,
  type BoardData,
  type InitData,
  type SubmitData,
  type GetData,
  type TSocket,
} from "./squaredleServiceBase.ts"
import { Trie, TrieNode } from "../../utils/trie.ts"
import { getRandomWeightedLetter } from "../../utils/util.ts"

interface BoardCell {
  letter: string
  instances: number
  starts: number
}

export default class extends SquaredleServiceBase {
  words: string[]
  wordTrie: Trie
  dictionary: string[]
  size: number
  revealed: Set<string>
  answers: Map<string, [number, number][]>
  gameStatus: string
  board: string[][]
  instanceCount: number[][]
  startingCount: number[][]
  bonusWords?: Set<string>

  constructor(roomId: string) {
    super(roomId)
    const wordList = fs.readFileSync(
      "./server/assets/squaredle_words.txt",
      "utf8"
    )
    this.words = wordList.trim().split("\n")
    this.wordTrie = new Trie()
    this.words.forEach((word) => {
      this.wordTrie.insert(word)
    })
    const dictionary = fs.readFileSync("./server/assets/zyzzyva.txt", "utf8")
    this.dictionary = dictionary.trim().split("\n")
    this.size = 0
    this.revealed = new Set()
    this.answers = new Map()
    this.gameStatus = "menu"
    this.board = []
    this.instanceCount = []
    this.startingCount = []
  }

  initAction({ size }: InitData, _sender: TSocket) {
    if (size <= 2) return
    this.size = size
    const minLargest = Math.min((size * size) / 2, 10)
    const startingWords = this.words.filter(
      (word) => word.length > minLargest && word.length < size * size
    )
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
      const startingWord =
        startingWords[Math.floor(Math.random() * startingWords.length)]
      const ox = Math.floor(Math.random() * size)
      const oy = Math.floor(Math.random() * size)
      const path = this.findPath(ox, oy, startingWord.length, [])
      for (let i = 0; i < startingWord.length; i++) {
        const c = path[i]
        this.board[c[0]][c[1]] = startingWord.charAt(i)
      }
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!this.board[i][j]) {
            this.board[i][j] = getRandomWeightedLetter()!
          }
        }
      }
    } while (
      !this.solve() ||
      Array.from(this.answers.keys()).length > size * size * size
    )
    const answer = Array.from(this.answers.keys())
    answer.sort()
    console.log(JSON.stringify(answer))
    this.gameStatus = "ongoing"
    this.sendBoard(this.getState())
  }

  submitAction(data: SubmitData, socket: TSocket) {
    const word = data.toUpperCase()
    if (this.revealed.has(word)) {
      this.sendBoard(this.getState(), socket)
      return
    }
    if (this.answers.has(word)) {
      const letters = this.answers.get(word)!
      this.startingCount[letters[0][0]][letters[0][1]]--
      for (const [x, y] of letters) {
        this.instanceCount[x][y]--
      }
      this.revealed.add(word)
      this.sendRevealWord(word)
      this.sendLog(`${socket.ign} found a word: ${word}`)
      this.sendGuessResponse({ word, result: "valid" }, socket)
    } else if (this.dictionary.includes(word)) {
      this.sendGuessResponse({ word, result: "bonus" }, socket)
      this.sendLog(`${socket.ign} found a bonus word: ${word}`)
      this.sendBonusWord(word)
    } else {
      this.sendGuessResponse({ word, result: "invalid" }, socket)
    }
  }

  getAction(_data: GetData, socket: TSocket) {
    if (this.gameStatus !== "menu") {
      this.sendBoard(this.getState(), socket)
    }
  }

  private getAdjacents([ox, oy]: [number, number]): [number, number][] {
    return (
      [
        [1, 1],
        [0, 1],
        [-1, 1],
        [1, 0],
        [-1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
      ] as [number, number][]
    ).filter(([nx, ny]) => {
      const x = ox + nx
      const y = oy + ny
      return x >= 0 && x < this.size && y >= 0 && y < this.size
    })
  }

  private shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[j]
      arr[j] = arr[i]
      arr[i] = temp
    }
  }

  private findPath(
    x: number,
    y: number,
    k: number,
    path: [number, number][]
  ): [number, number][] {
    if (path.length === k) return path
    const validMoves = this.getAdjacents([x, y])
    this.shuffle(validMoves)
    for (const [dx, dy] of validMoves) {
      const nx = x + dx
      const ny = y + dy
      if (path.find(([i, j]) => i === nx && j === ny)) continue
      path.push([nx, ny])
      const foundPath = this.findPath(nx, ny, k, path)
      if (foundPath.length === k) return foundPath
      path.pop()
    }
    return []
  }

  private traverse(
    x: number,
    y: number,
    path: [number, number][],
    trieNode: TrieNode
  ) {
    if (!!trieNode.word && !this.answers.has(trieNode.word)) {
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
      if (
        path.find(([i, j]) => i === nx && j === ny) ||
        !trieNode.children[char]
      ) {
        continue
      }
      path.push([nx, ny])
      this.traverse(nx, ny, path, trieNode.children[char])
      path.pop()
    }
  }

  private solve(): boolean {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.traverse(i, j, [], this.wordTrie.root)
      }
    }
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.instanceCount[i][j] === 0) return false
      }
    }
    return true
  }

  private getState(): BoardData {
    const boardInfo: BoardCell[][] = []
    for (let x = 0; x < this.size; x++) {
      boardInfo[x] = []
      for (let y = 0; y < this.size; y++) {
        boardInfo[x][y] = {
          letter: this.board[x][y],
          instances: this.instanceCount[x][y],
          starts: this.startingCount[x][y],
        }
      }
    }
    return {
      board: boardInfo,
      foundWords: Array.from(this.revealed),
      allWords: Object.fromEntries(this.answers),
    }
  }
}
