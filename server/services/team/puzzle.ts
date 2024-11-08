import { Id, Panel } from "./types"

export abstract class Puzzle {
  id: Id

  constructor(id: Id) {
    this.id = id
  }

  abstract panels(): Panel[]
}