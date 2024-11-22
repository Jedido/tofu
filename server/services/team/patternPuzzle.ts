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
    this.puzzleBoard = {
      color,
      symbol,
      board: PatternPuzzle.makeBoard()
    }
    this.keyBoard = {
      color,
      symbol,
      board: PatternPuzzle.makeBoard()
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

  static makeBoard(): boolean[][] {
    return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => Math.random() > 0.5))
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