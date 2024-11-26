import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, WantedPuzzleSolution } from "./types"

const { randomItem, shuffle } = require("../../utils/util.js")

interface WantedPuzzlePI extends PanelInfo {
  name: string
  faces: string[]
}
interface WantedKeyPI extends PanelInfo {
  name: string
  type: string
  data: string[]
}

export class WantedPuzzle extends Puzzle {
  static names: Set<string>
  puzzle: WantedPuzzlePI
  key: WantedKeyPI

  static reset() {
    this.names = new Set<string>()
  }

  constructor(id: Id) {
    super(id)

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let name = ""
    do {
      const num = Math.floor(Math.random() * 90) + 10
      name = `${letters.charAt(Math.floor(Math.random() * 26))}-${num}`
    } while (WantedPuzzle.names.has(name));

    const faces: string[] = ["angry", "frown", "heart-eyes", "laughing", "smile", "sunglasses", "wink", "surprise", "dizzy"]
    shuffle(faces)
    const wanted = new Set<string>()
    while (wanted.size < 2) {
      wanted.add(randomItem(faces))
    }
    this.puzzle = {
      name,
      faces
    }
    this.key = {
      name,
      type: "face",
      data: Array.from(wanted)
    }
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Wanted,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Wanted,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static solve({ selected }: WantedPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as WantedPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as WantedKeyPI
    const faces: string[] = selected.map((s, i) => {
      if (s) {
        return puzzle.faces[i]
      }
      return ""
    }).filter(x => x)
    switch (key.type) {
      case "face": {
        if (faces.length !== key.data.length) {
          return false
        }
        for (let i = 0; i < key.data.length; i++) {
          if (!key.data.includes(faces[i])) {
            return false
          }
        }
        return true
      }
      default: return false
    }
  }
}