export type Id = number

export enum PuzzleEnum {
  Danger = "d"
}

export enum PanelEnum {
  Puzzle = "p",
  Key1 = "k1",
  Key2 = "k2"
}

export type Panel = {
  id: Id
  puzzle: PuzzleEnum
  panel: PanelEnum
  state: PanelInfo
}

export type PanelInfo = {}

export interface Submission {
  type: PuzzleEnum,
  id: Id,
  data: PuzzleSolution
}

export interface PuzzleSolution {}
export interface DangerPuzzleSolution extends PuzzleSolution {
  x: number
  y: number
}
