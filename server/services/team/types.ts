export type Id = number

export enum PuzzleEnum {
  Danger = "d",
  Wire = "w",
  Request = 'r',
  Pattern = 'p',
  Dice = "m",
  Wanted = "f",
  Algebra = "x"
}

export enum PanelEnum {
  Puzzle = "p",
  Wire="w",
  Key1 = "k1",
  Key2 = "k2"
}

export type Panel = {
  id: Id
  puzzle: PuzzleEnum
  panel: PanelEnum
  state: PanelInfo
}

export type Wire = {
  index: number,
  color: string,
  stripe: string,
  y: number
}

export type PanelInfo = {}

export interface Submission {
  type: PuzzleEnum,
  id: Id,
  data: PuzzleSolution,
  stack: number
}

export interface PuzzleSolution {}
export interface DangerPuzzleSolution extends PuzzleSolution {
  x: number
  y: number
}
export interface WirePuzzleSolution extends PuzzleSolution {
  next: number
}
export interface RequestPuzzleSolution extends PuzzleSolution {
  sequence: number[]
}
export interface PatternPuzzleSolution extends PuzzleSolution {
  board: boolean[][]
}
export interface DicePuzzleSolution extends PuzzleSolution {
  sum: number
}
export interface WantedPuzzleSolution extends PuzzleSolution {
  selected: boolean[]
}
export interface AlgebraPuzzleSolution extends PuzzleSolution {
  y: number
}
