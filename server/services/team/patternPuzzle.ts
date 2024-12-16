import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, PatternPuzzleSolution } from "./types"

const { colors, symbols, randomItem } = require("../../utils/util.js")

interface PatternPI extends PanelInfo {
  color: string,
  symbol: string,
  board: boolean[][]
}

export class PatternPuzzle extends Puzzle {
  static combos: Set<string>
  puzzleBoard: PatternPI
  keyBoard: PatternPI

  static reset() {
    this.combos = new Set<string>()
  }

  constructor(id: Id) {
    super(id)

    let color = ""
    let symbol = ""
    let combo = ""
    do {
      color = randomItem(colors)
      symbol = randomItem(symbols)
      combo = `${color}-${symbol}`
    } while (PatternPuzzle.combos.has(combo));
    PatternPuzzle.combos.add(combo)
    const filled = Math.floor(Math.random() * 3) + 4
    this.puzzleBoard = {
      color,
      symbol,
      board: PatternPuzzle.makeBoard(filled, true)
    }
    this.keyBoard = {
      color,
      symbol,
      board: PatternPuzzle.makeBoard(filled, false)
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Pattern,
      panel: PanelEnum.Puzzle,
      state: this.puzzleBoard
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Pattern,
      panel: PanelEnum.Key1,
      state: this.keyBoard
    }]
  }

  static makeBoard(num: number, skip: boolean): boolean[][] {
    const length = 3
    let remaining = length * length
    if (skip) {
      remaining--;
    }
    return Array.from({ length }, () => Array.from({ length }, () => {
      const result = remaining > 0 && Math.random() < num / remaining
      remaining--
      if (result) {
        num--
      }
      return result
    }))
  }

  static solve({ board }: PatternPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const key = puzzleParts.get(PanelEnum.Key1)! as PatternPI
    for (let i = 0; i < board.length; i++) {
      const row = board[i]
      for (let j = 0; j < row.length; j++) {
        if (board[i][j] !== key.board[i][j]) {
          return false
        }
      }
    }
    return true
  }
}