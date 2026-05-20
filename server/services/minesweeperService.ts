import { TSocket } from "../utils/tsocket.ts"
import GameService from "./gameService.ts"

const BOMB = -10
const FLAG = -20
const HIDDEN = -30
const BLANK = -40
const BOOM = -50

class MinesweeperService extends GameService {
  readonly boardEvent: string
  readonly updateSpaceEvent: string

  field: number[][]
  revealed: number[][]
  gameStatus: string
  spaces: number
  numBombs: number
  time: Date | number

  constructor(roomId: string) {
    super(roomId)

    // requests
    this.actions = {
      "minesweeper-get-board": this.getBoard.bind(this),
      "minesweeper-init": this.init.bind(this),
      "minesweeper-reveal": this.reveal.bind(this),
      "minesweeper-flag": this.flag.bind(this),
    }
    // responses
    this.boardEvent = "minesweeper-board"
    this.updateSpaceEvent = "minesweeper-update-space"

    // game state
    this.field = []
    this.revealed = []
    this.gameStatus = ""
    this.spaces = 0
    this.numBombs = 100
    this.time = 0
  }

  revealBoard() {
    const size = this.field.length
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (this.revealed[x][y] === HIDDEN) {
          this.revealed[x][y] = this.field[x][y]
        }
      }
    }
  }

  increment(field: number[][], x: number, y: number) {
    if (this.verify(field, x, y) && field[x][y] !== BOMB) {
      field[x][y]++
    }
  }

  verify(field: number[][], x: number, y: number): boolean {
    const size = field.length
    return x >= 0 && x < size && y >= 0 && y < size
  }

  getBoard(_: any, socket: TSocket) {
    socket.emit(this.boardEvent, this.getBoardState())
  }

  // returns the whole state of the board (expensive)
  getBoardState() {
    return {
      status: this.gameStatus,
      size: this.revealed.length,
      mines: this.numBombs,
      board: this.revealed,
      time:
        this.gameStatus === "ongoing"
          ? Math.round(
              (new Date().getTime() - (this.time as Date).getTime()) / 1000
            )
          : this.time,
    }
  }

  init({ size, bombs }: { size: number; bombs: number }, socket: TSocket) {
    this.gameStatus = "ongoing"
    this.field = []
    this.revealed = []
    this.time = new Date()
    for (let x = 0; x < size; x++) {
      const row: number[] = []
      const rev: number[] = []
      for (let y = 0; y < size; y++) {
        row[y] = 0
        rev[y] = HIDDEN
      }
      this.field[x] = row
      this.revealed[x] = rev
    }
    this.numBombs = bombs
    let bombsLeft = bombs
    let spacesLeft = size * size
    this.spaces = size * size
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (bombsLeft / spacesLeft > Math.random()) {
          this.field[x][y] = BOMB
          this.increment(this.field, x + 1, y + 1)
          this.increment(this.field, x + 1, y)
          this.increment(this.field, x + 1, y - 1)
          this.increment(this.field, x, y + 1)
          this.increment(this.field, x, y - 1)
          this.increment(this.field, x - 1, y + 1)
          this.increment(this.field, x - 1, y)
          this.increment(this.field, x - 1, y - 1)
          bombsLeft--
          this.spaces--
        }
        spacesLeft--
      }
    }
    this.broadcastFn(
      "log",
      `${socket.ign} started a new game (bombs=${bombs}, size=${size})`
    )
    this.broadcastFn(this.boardEvent, this.getBoardState())
  }

  reveal({ x, y }: { x: number; y: number }, socket: TSocket) {
    if (this.revealed[x][y] !== FLAG) {
      this.broadcastFn("log", `${socket.ign} revealed (${x}, ${y})`)
      if (this.field[x][y] === BOMB) {
        this.revealBoard()
        this.revealed[x][y] = BOOM
        this.gameStatus = "lose"
        this.time = Math.round(
          (new Date().getTime() - (this.time as Date).getTime()) / 1000
        )
        this.broadcastFn(this.boardEvent, this.getBoardState())
        this.broadcastFn(
          "log",
          `${socket.ign} blew everyone up after ${this.time} seconds.`
        )
      } else {
        const queue: [number, number][] = []
        queue.push([x, y])
        while (queue.length > 0) {
          const next = queue.shift()!
          const a = parseInt(next[0].toString())
          const b = parseInt(next[1].toString())
          if (this.verify(this.field, a, b)) {
            const reveal = this.revealed[a][b]
            if (reveal === HIDDEN) {
              const val = this.field[a][b]
              this.spaces--
              if (val === 0) {
                queue.push([a + 1, b + 1])
                queue.push([a + 1, b])
                queue.push([a + 1, b - 1])
                queue.push([a, b + 1])
                queue.push([a, b - 1])
                queue.push([a - 1, b + 1])
                queue.push([a - 1, b])
                queue.push([a - 1, b - 1])
                this.revealed[a][b] = BLANK
              } else {
                this.revealed[a][b] = val
              }
            }
          }
        }
        if (this.spaces === 0) {
          this.revealBoard()
          this.gameStatus = "win"
          this.time = Math.round(
            (new Date().getTime() - (this.time as Date).getTime()) / 1000
          )
          this.broadcastFn(this.boardEvent, this.getBoardState())
          this.broadcastFn(
            "log",
            `${socket.ign} revealed the last space after ${this.time} seconds.`
          )
        } else if (this.field[x][y] === 0) {
          this.broadcastFn(this.boardEvent, this.getBoardState())
        } else {
          this.broadcastFn(this.updateSpaceEvent, x, y, this.revealed[x][y])
        }
      }
    }
  }

  flag({ x, y }: { x: number; y: number }) {
    if (this.revealed[x][y] === FLAG) {
      this.revealed[x][y] = HIDDEN
    } else if (this.revealed[x][y] === HIDDEN) {
      this.revealed[x][y] = FLAG
    }
    this.broadcastFn(this.updateSpaceEvent, x, y, this.revealed[x][y])
  }
}
MinesweeperService.prototype.id = "minesweeper"

export default MinesweeperService
