import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, DicePuzzleSolution } from "./types"

const { colors, symbols, randomItem } = require("../../utils/util.js")

interface DicePuzzlePI extends PanelInfo {
  dice: number,
  color: string
}
interface DiceKeyPI extends PanelInfo {
  sum: number,
  dice: number,
  color: string
}

export class DicePuzzle extends Puzzle {
  static combos: Set<string>
  puzzle: DicePuzzlePI
  key: DiceKeyPI

  static reset() {
    this.combos = new Set<string>()
  }

  constructor(id: Id) {
    super(id)

    let color = ""
    let sum = 0
    let dice = 0
    let combo = ""
    do {
      color = randomItem(colors)
      dice = Math.ceil(Math.random() * 6)
      sum = Math.ceil(Math.random() * 6 * dice)
      combo = `${color}-${dice}`
    } while (DicePuzzle.combos.has(combo));
    DicePuzzle.combos.add(combo)
    this.puzzle = {
      color,
      dice
    }
    this.key = {
      color,
      dice,
      sum
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Dice,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Dice,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static makeBoard(): boolean[][] {
    return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => Math.random() > 0.5))
  }

  static solve({ sum }: DicePuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const key = puzzleParts.get(PanelEnum.Key1)! as DiceKeyPI
    return key.sum === sum
  }
}