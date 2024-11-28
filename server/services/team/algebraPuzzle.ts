import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, AlgebraPuzzleSolution } from "./types"

const { randomItem } = require("../../utils/util.js")

interface AlgebraPuzzlePI extends PanelInfo {
  n: number
  hint: string
  y: string
}
interface AlgebraKeyPI extends PanelInfo {
  x: string
  n: number
  equations: PuzzleParams[]
}
interface PuzzleParams {
  m: number
  b: number
  n: number
  y: string
}

export class AlgebraPuzzle extends Puzzle {
  static readonly letters = "abcdefghijklmnopqrstuvwxyz"
  static answers: Map<string, number>
  static n: number
  static y: string
  puzzle: AlgebraPuzzlePI
  key: AlgebraKeyPI

  static reset() {
    this.answers = new Map<string, number>()
    for (let c of this.letters) {
      this.answers.set(c, Math.floor(Math.random() * 10))
    }
    this.n = 1
    console.log(this.answers.entries())
    this.y = AlgebraPuzzle.letters.charAt(Math.floor(Math.random() * AlgebraPuzzle.letters.length))
  }

  constructor(id: Id) {
    super(id)

    const curLetter = AlgebraPuzzle.y
    const curValue = AlgebraPuzzle.answers.get(curLetter)!
    const letterSet: Set<string> = new Set([curLetter])
    while (letterSet.size < 4) {
      letterSet.add(AlgebraPuzzle.letters.charAt(Math.floor(Math.random() * AlgebraPuzzle.letters.length)))
    }
    letterSet.delete(curLetter)
    const nextLetters = Array.from(letterSet)
    this.puzzle = {
      hint: AlgebraPuzzle.n === 1 ? `${curLetter} = ${curValue}` : '',
      n: AlgebraPuzzle.n,
      y: randomItem(nextLetters)
    }
    this.key = {
      x: curLetter,
      n: AlgebraPuzzle.n,
      equations: nextLetters.map(y => AlgebraPuzzle.getPuzzleParams(curValue, y))
    }
    AlgebraPuzzle.n++
    AlgebraPuzzle.y = this.puzzle.y
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Algebra,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Algebra,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static getPuzzleParams(from: number, y: string): PuzzleParams {
    const to = AlgebraPuzzle.answers.get(y)!
    let m = 0
    let n = 0
    let b = 10
    while (Math.abs(b) > 9) {
      m = Math.ceil(Math.random() * 4)
      n = Math.ceil(Math.random() * 4)
      b = (n * to) - (m * from)
    }
    return { m, n, b, y }
  }

  static solve({ y }: AlgebraPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as AlgebraPuzzlePI
    return AlgebraPuzzle.answers.get(puzzle.y) === y
  }
}