import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, DicePuzzleSolution } from "./types"
import { BitArray } from "../../utils/bitarray"

const { colors, randomItem } = require("../../utils/util.js")

interface DicePuzzlePI extends PanelInfo {
  dice: number[]
  color: string
}
interface DiceKeyPI extends PanelInfo {
  count: number
  color: string
  dots: Uint32Array
  sum: number
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
    let count = 0
    let combo = ""
    do {
      color = randomItem(colors)
      count = Math.ceil(Math.random() * 6)
      sum = Math.floor(Math.random() * (count * 5 + 1)) + count
      combo = `${color}-${count}`
    } while (DicePuzzle.combos.has(combo));
    DicePuzzle.combos.add(combo)
    const dots = new BitArray(36)
    const total = 36
    let colored = sum
    for (let i = total; i > 0; i--) {
      if (Math.random() < colored / i) {
        colored--
        dots.set(i - 1, true)
      }
    }

    const dice = Array.from({ length: count }, () => Math.ceil(Math.random() * 6))
    this.puzzle = {
      color,
      dice
    }
    this.key = {
      color,
      count,
      dots: dots.data,
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

  static solve({ sum }: DicePuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const key = puzzleParts.get(PanelEnum.Key1)! as DiceKeyPI
    return key.sum === sum
  }
}