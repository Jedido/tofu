import { Puzzle } from "./puzzle"
import { Panel, PanelInfo, PanelEnum, PuzzleEnum, Id, AddressPuzzleSolution } from "./types"

const { randomItem, shuffle } = require("../../utils/util.js")

interface AddressPuzzlePI extends PanelInfo {
  city: string
  streets: string[]
}
interface AddressKeyPI extends PanelInfo {
  city: string
  streets: string[]
}

export class AddressPuzzle extends Puzzle {
  readonly streetNames = [
    "Oak", "Maple", "Pine", "Cedar", "Elm", "Birch", "Willow", 
    "Sunset", "Meadow", "River", "Horizon", "Lakeside", "Forest", 
    "Hilltop", "Ridge", "Valley", "Prairie", "Shadow", "Silver", 
    "Golden", "Crystal", "Emerald", "Amber", "Orchard", "Brook", 
    "Haven", "Fern", "Briar", "Magnolia", "Aspen", "Juniper", "Fox"
  ]
  readonly streetTypes = ["St", "Ave", "Blvd", "Dr", "Rd", "Ln", "Ct", "Way", "Pl"]
  readonly cityPrefixes = [
    "Spring", "Ever", "Clear", "Frost", "Shadow", "Willow", 
    "Pine", "Raven", "Silver", "Golden", "Bright", "Iron", 
    "Brook", "Ash", "Stone", "Green", "Wind", "Crystal"
  ]
  readonly citySuffixes = [
    "vale", "wood", "field", "haven", "grove", "bridge", 
    "shore", "ridge", "moor", "creek", "bourne", "water", 
    "hill", "ford", "watch", "fall", "town", "point", "cliff"
  ]

  static cities: Set<string>
  puzzle: AddressPuzzlePI
  key: AddressKeyPI

  static reset() {
    this.cities = new Set<string>()
  }

  constructor(id: Id) {
    super(id)
    const streets: string[] = []
    let city;
    do {
      city = this.generateCity()
    } while (AddressPuzzle.cities.has(city));
    AddressPuzzle.cities.add(city)

    for (let i = 0; i < 4; i++) {
      let street;
      do {
        street = this.generateStreet()
      } while (streets.includes(street));
      streets.push(street)
    }
    this.puzzle = {
      city,
      streets
    }
    const moreStreets: string[] = Array.from(streets, (s) => s)
    for (let i = 0; i < 4; i++) {
      let street;
      do {
        street = this.generateStreet()
      } while (moreStreets.includes(street));
      moreStreets.push(street)
    }
    shuffle(moreStreets)
    this.key = {
      city,
      streets: moreStreets
    }
  }

  generateCity(): string {
    return `${randomItem(this.cityPrefixes)}${randomItem(this.citySuffixes)}`
  }

  generateStreet(): string {
    const street = randomItem(this.streetNames)
    const streetType = randomItem(this.streetTypes)
    return `${street} ${streetType}`
  }

  override panels(): Panel[] {
    return [{
      id: this.id,
      puzzle: PuzzleEnum.Address,
      panel: PanelEnum.Puzzle,
      state: this.puzzle
    }, {
      id: this.id,
      puzzle: PuzzleEnum.Address,
      panel: PanelEnum.Key1,
      state: this.key
    }]
  }

  static solve({ north }: AddressPuzzleSolution, puzzleParts: Map<PanelEnum, PanelInfo>): boolean {
    const puzzle = puzzleParts.get(PanelEnum.Puzzle)! as AddressPuzzlePI
    const key = puzzleParts.get(PanelEnum.Key1)! as AddressKeyPI
    for (let i = 0; i < puzzle.streets.length; i++) {
      const street = puzzle.streets[i]
      const hit = key.streets.findIndex((s) => s === street)
      if (hit === -1 || hit >= 4 === north[i]) {
        return false
      }
    }
    return true
  }
}