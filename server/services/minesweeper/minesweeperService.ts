import {
  MinesweeperServiceBase,
  type GetBoardData,
  type InitData,
  type CoordData,
  type BoardData,
  type TSocket,
} from "./minesweeperServiceBase.ts"

const BOMB = -10
const FLAG = -20
const HIDDEN = -30
const BLANK = -40
const BOOM = -50

export default class extends MinesweeperServiceBase {
  field: number[][] = []
  revealed: number[][] = []
  gameStatus = ""
  spaces = 0
  numBombs = 100
  time: Date | number = 0

  private revealBoard() {
    const size = this.field.length
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (this.revealed[x][y] === HIDDEN) {
          this.revealed[x][y] = this.field[x][y]
        }
      }
    }
  }

  private increment(field: number[][], x: number, y: number) {
    if (this.verify(field, x, y) && field[x][y] !== BOMB) {
      field[x][y]++
    }
  }

  private verify(field: number[][], x: number, y: number): boolean {
    const size = field.length
    return x >= 0 && x < size && y >= 0 && y < size
  }

  private getBoardState(): BoardData {
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
          : (this.time as number),
    }
  }

  getBoardAction(_data: GetBoardData, sender: TSocket) {
    this.sendBoard(this.getBoardState(), sender)
  }

  initAction({ size, bombs }: InitData, sender: TSocket) {
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
      `${sender.ign} started a new game (bombs=${bombs}, size=${size})`
    )
    this.sendBoard(this.getBoardState())
  }

  revealAction({ x, y }: CoordData, sender: TSocket) {
    if (this.revealed[x][y] !== FLAG) {
      this.broadcastFn("log", `${sender.ign} revealed (${x}, ${y})`)
      if (this.field[x][y] === BOMB) {
        this.revealBoard()
        this.revealed[x][y] = BOOM
        this.gameStatus = "lose"
        this.time = Math.round(
          (new Date().getTime() - (this.time as Date).getTime()) / 1000
        )
        this.sendBoard(this.getBoardState())
        this.broadcastFn(
          "log",
          `${sender.ign} blew everyone up after ${this.time} seconds.`
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
          this.sendBoard(this.getBoardState())
          this.broadcastFn(
            "log",
            `${sender.ign} revealed the last space after ${this.time} seconds.`
          )
        } else if (this.field[x][y] === 0) {
          this.sendBoard(this.getBoardState())
        } else {
          this.sendUpdateSpace({ x, y, value: this.revealed[x][y] })
        }
      }
    }
  }

  flagAction({ x, y }: CoordData, _sender: TSocket) {
    if (this.revealed[x][y] === FLAG) {
      this.revealed[x][y] = HIDDEN
    } else if (this.revealed[x][y] === HIDDEN) {
      this.revealed[x][y] = FLAG
    }
    this.sendUpdateSpace({ x, y, value: this.revealed[x][y] })
  }
}
