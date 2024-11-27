import { Puzzle } from "./puzzle"
import { DangerPuzzleSolution, Panel, PanelInfo, PanelEnum, PuzzleEnum, Id } from "./types"

interface DangerPuzzlePI extends PanelInfo {
  name: string
  board: boolean[][]
}
interface DangerKeyPI extends PanelInfo {
  name: string
  board: boolean[][]
  rows: number[]
  cols: number[]
}

export class DangerPuzzle extends Puzzle {
  static names: Set<string>
  readonly shapes: Array<boolean[][]> = [[
    [true, true],
    [true, false]
  ], [
    [true, true],
    [false, true]
  ], [
    [true, false],
    [true, true]
  ], [
    [false, true],
    [true, true]
  ], [
    [true, true, true]
  ], [
    [true],
    [true],
    [true]
  ]]

  puzzleBoard: DangerPuzzlePI
  key: DangerKeyPI

  static reset() {
    this.names = new Set()
  }

  constructor(id: Id) {
    super(id)
    const targetShape = this.shapes[Math.floor(Math.random() * this.shapes.length)]
    const width = 4
    const height = 4
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let name = ""
    do {
      const num = Math.floor(Math.random() * 90) + 10
      name = `${letters.charAt(Math.floor(Math.random() * 26))}-${num}`
    } while (DangerPuzzle.names.has(name));
    function makeBoard() {
      const ox = Math.floor(Math.random() * (width - targetShape[0].length + 1))
      const oy = Math.floor(Math.random() * (height - targetShape.length + 1))
      const board = Array.from({ length: height }, () => Array(width).fill(false))
      for (let i = 0; i < targetShape.length; i++) {
        for (let j = 0; j < targetShape[i].length; j++) {
          board[oy + i][ox + j] = targetShape[i][j]
        }
      }
      return { name, board }
    }
    this.puzzleBoard = makeBoard()
    const keyInfo = makeBoard()
    let numExtras = Math.floor(Math.random() * 4) + 5
    const rows = Array.from({ length: height }, () => 0)
    const cols = Array.from({ length: width }, () => 0)
    let openSpaces = 13
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (!keyInfo.board[j][i]) {
          if (numExtras / openSpaces > Math.random()) {
            keyInfo.board[j][i] = true
            rows[j]++
            cols[i]++
            numExtras--
          }
          openSpaces--
        } else {
          keyInfo.board[j][i] = false
          rows[j]++
          cols[i]++
        }
      }
    }
    this.key = {
      name,
      board: keyInfo.board,
      rows,
      cols
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Danger,
      panel: PanelEnum.Puzzle,
      state: this.puzzleBoard
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Danger,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static solve({ x, y }: DangerPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as DangerPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as DangerKeyPI
    const rows = Array.from(key.rows)
    const cols = Array.from(key.cols)
    for (let i = 0; i < puzzle.board.length; i++) {
      const row = puzzle.board[i]
      for (let j = 0; j < row.length; j++) {
        if (key.board[i][j]) {
          rows[i]--
          cols[j]--
        }
        if (row[j]) {
          if (i + y >= 0 && i + y < puzzle.board.length && j + x >= 0 && j + x < puzzle.board[0].length) {
            if (key.board[i][j] && puzzle.board[i + y][j + x]) {
              return false
            }
            rows[i + y]--
            cols[j + x]--
          } else {
            return false
          }
        }
      }
    }
    return rows.every(x => !x) && cols.every(x => !x)
  }
}