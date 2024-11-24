import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, RequestPuzzleSolution } from "./types"
const { randomItem, shuffle } = require("../../utils/util.js")

interface RequestPuzzlePI extends PanelInfo {
  name: string
}
interface RequestKeyPI extends PanelInfo {
  requestors: {
    name: string,
    sequence: number[]
  }[]
}

export class RequestPuzzle extends Puzzle {
  readonly prefixes = [
    "Al", "Be", "De", "El", "Fa", "Ga", "Jo", "Ka", "La", "Ma",
    "Na", "Pa", "Ra", "Sa", "Ta", "Va", "Zy", "Fi", "Lu", "Or"
  ]
  readonly roots = [
    "lin", "mar", "son", "vin", "dor", "ric", "dra", "len", "thy",
    "mal", "ven", "cel", "ren", "vra", "ton", "ris", "ver", "wyn", "jas"
  ]
  readonly suffixes = [
    "ina", "ous", "ian", "lyn", "ith", "ene", "ane", "ell", "ris", "wyn",
    "ion", "ora", "ara", "ryn", "yna", "ine", "iel", "lin", "mar", "ven"
  ]
  static names: Set<string>

  puzzle: RequestPuzzlePI
  key: RequestKeyPI

  static reset() {
    this.names = new Set<string>()
  }

  constructor(id: Id) {
    super(id)
    const names = Array.from({ length: 4 }, () => {
      let name = ""
      do {
        name = this.generateName()
      } while (RequestPuzzle.names.has(name));
      RequestPuzzle.names.add(name)
      return name
    })
    const targetName = names[0]
    shuffle(names)
    this.puzzle = {
      name: targetName
    }
    this.key = {
      requestors: names.map((name) => {
        return {
          name,
          sequence: Array.from({ length: 4 }, () => Math.floor(Math.random() * 4))
        }
      })
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Request,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Request,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static solve({ sequence }: RequestPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as RequestPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as RequestKeyPI
    const requestor = key.requestors.find(r => r.name === puzzle.name)
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] !== requestor?.sequence[i]) {
        return false;
      }
    }
    return true;
  }

  generateName() {
    const prefix: string = randomItem(this.prefixes)
    const root: string = randomItem(this.roots)
    const suffix: string = randomItem(this.suffixes)

    return this.stylizeName(prefix + root + suffix)
  }

  stylizeName(name: string): string {
    if (Math.random() > 0.3) {
      return name
    }

    // Randomly capitalize the second letter for effect
    if (Math.random() > 0.6) {
      name = name.substring(0, 2) + name.charAt(2).toUpperCase() + name.slice(3)
    }
  
    return name.charAt(0).toUpperCase() + name.slice(1) // Ensure the first letter is capitalized
  }
}