import { z } from "zod"
import { Action, DataType, Message } from "../baseSpec.ts"

export const serviceName = "minesweeper"

export const GetBoardData: DataType = z.unknown()
export const CoordData: DataType = z.object({ x: z.number(), y: z.number() })
export const InitData: DataType = z.object({
  size: z.number(),
  bombs: z.number(),
})
export const BoardData: DataType = z.object({
  status: z.string(),
  size: z.number(),
  mines: z.number(),
  board: z.array(z.array(z.number())),
  time: z.number(),
})
export const UpdateSpaceData: DataType = z.object({
  x: z.number(),
  y: z.number(),
  value: z.number(),
})

export const GetBoardAction: Action = {
  action: "get-board",
  data: GetBoardData,
}
export const InitAction: Action = { action: "init", data: InitData }
export const RevealAction: Action = { action: "reveal", data: CoordData }
export const FlagAction: Action = { action: "flag", data: CoordData }

export const BoardEvent: Message = { event: "board", data: BoardData }
export const UpdateSpaceEvent: Message = {
  event: "update-space",
  data: UpdateSpaceData,
}
