import { Puzzle } from "./puzzle"
import { DangerPuzzleSolution, Panel, PanelInfo, PanelEnum, PuzzleEnum, Id } from "./types"

interface DangerPuzzlePI extends PanelInfo {
  name: string,
  board: number[][]
}
interface DangerKeyPI extends PanelInfo {
  name: string,
  board: number[][]
}

export class DangerPuzzle extends Puzzle {
  readonly shapes: Array<number[][]> = [[
    [1, 1],
    [1, 0]
  ], [
    [1, 1],
    [0, 1]
  ], [
    [1, 0],
    [1, 1]
  ], [
    [0, 1],
    [1, 1]
  ], [
    [1, 1, 1]
  ], [
    [1],
    [1],
    [1]
  ]]

  puzzleBoard: DangerPuzzlePI
  dangerBoard: DangerKeyPI

  constructor(id: Id) {
    super(id)
    const targetShape = this.shapes[Math.floor(Math.random() * this.shapes.length)]
    const width = 4
    const height = 4
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const name = `${letters.charAt(Math.floor(Math.random() * 26))}-${this.id}`
    function makeBoard() {
      const ox = Math.floor(Math.random() * (width - targetShape[0].length + 1))
      const oy = Math.floor(Math.random() * (height - targetShape.length + 1))
      const board = Array.from({ length: height }, () => Array(width).fill(0))
      for (let i = 0; i < targetShape.length; i++) {
        for (let j = 0; j < targetShape[i].length; j++) {
          board[oy + i][ox + j] = targetShape[i][j]
        }
      }
      return { name, board }
    }
    this.puzzleBoard = makeBoard()
    this.dangerBoard = makeBoard()
    let numExtras = Math.floor(Math.random() * 4) + 3
    let openSpaces = 13
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (this.dangerBoard.board[j][i] === 0) {
          if (numExtras / openSpaces > Math.random()) {
            this.dangerBoard.board[j][i] = 1
            numExtras--
          }
          openSpaces--
        }
      }
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
      state: this.dangerBoard
    }]
  }

  static solve({ x, y }: DangerPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as DangerPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as DangerKeyPI
    for (let i = 0; i < puzzle.board.length; i++) {
      const row = puzzle.board[i]
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 1) {
          if (i + y < 0 || i + y > puzzle.board.length || j + x < 0 || j + x > puzzle.board[0].length || key.board[i + y][j + x] !== 1) {
            return false
          }
        }
      }
    }
    return true
  }
}