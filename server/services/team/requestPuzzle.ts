import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, RequestPuzzleSolution } from "./types"
const { generateName, shuffle } = require("../../utils/util.js")

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
        name = generateName()
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
}