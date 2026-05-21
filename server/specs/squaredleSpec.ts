import { z } from "zod"
import type { DataType, Action, Message } from "../baseSpec.ts"

export const serviceName = "squaredle"

export const BoardCellData: DataType = z.object({
  letter: z.string(),
  instances: z.number(),
  starts: z.number(),
})
export const BoardData: DataType = z.object({
  board: z.array(z.array(BoardCellData)),
  foundWords: z.array(z.string()),
  allWords: z.record(z.string(), z.array(z.array(z.number()))),
})
export const InitData: DataType = z.object({ size: z.number() })
export const SubmitData: DataType = z.string()
export const GetData: DataType = z.unknown()
export const RevealWordData: DataType = z.string()
export const BonusWordData: DataType = z.string()
export const GuessResponseData: DataType = z.object({
  word: z.string(),
  result: z.string(),
})

export const InitAction: Action = { action: "init", data: InitData }
export const SubmitAction: Action = { action: "submit", data: SubmitData }
export const GetAction: Action = { action: "get", data: GetData }

export const BoardEvent: Message = { event: "board", data: BoardData }
export const RevealWordEvent: Message = {
  event: "reveal-word",
  data: RevealWordData,
}
export const BonusWordEvent: Message = {
  event: "bonus-word",
  data: BonusWordData,
}
export const GuessResponseEvent: Message = {
  event: "guess-response",
  data: GuessResponseData,
}
