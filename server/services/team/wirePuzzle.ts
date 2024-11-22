import { Panel, PanelEnum, PuzzleEnum, Wire, WirePuzzleSolution } from "./types"

const { colors, shuffle, randomItem } = require("../../utils/util.js")

export class WirePuzzle {
  static wires: Wire[]
  static order: number[]
  static quota: number

  static init(quota: number) {
    this.quota = quota
    this.wires = []
    this.order = []
    const combos = new Set<string>()
    combos.add("")

    const leftPositions = [0, 1, 2]
    const rightPositions = [0, 1, 2]
    shuffle(leftPositions)
    shuffle(rightPositions)
    const positions = leftPositions.concat(rightPositions)

    for (let i = 0; i < 6; i++) {
      if (i < quota) {
        this.order.push(i)
      }
      let color = ""
      let stripe = ""
      while (combos.has(color + stripe)) {
        color = randomItem(colors)
        stripe = Math.random() > 0.5 ? randomItem(colors) : ""
        if (color === stripe) {
          stripe = ""
        }
      }
      combos.add(color + stripe)
      this.wires.push({
        index: i,
        color,
        stripe,
        y: positions[i]
      })
    }
    shuffle(this.order)
  }

  // Allow for any id
  static getPanel(i: number, id: number): Panel[] {
    return [{
      id,
      puzzle: PuzzleEnum.Wire,
      panel: PanelEnum.Wire,
      state: {
        wire: this.wires[i],
        order: this.order.findIndex(x => x === this.wires[i].index),
        quota: this.quota
      }
    }]
  }

  static cut({ next }: WirePuzzleSolution) {
    return this.order.shift() === next
  }
}
