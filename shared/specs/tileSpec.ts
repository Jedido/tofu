import { z } from "zod"
import type { DataType, Action, Message } from "../baseSpec.ts"

export const serviceName = "tile"

export const NoData: DataType = z.unknown()
export const MoveData: DataType = z.object({
  unit: z.string(),
  direction: z.number(),
})
export const PaintData: DataType = z.object({
  unit: z.string(),
  color: z.string(),
})
export const UnitData: DataType = z.object({ unit: z.string() })
export const StateData: DataType = z.unknown()
export const UpdateUnitData: DataType = z.unknown()
export const CompleteOrderData: DataType = z.object({
  order: z.string(),
  unit: z.string(),
})
export const NewOrderData: DataType = z.unknown()
export const GrantToolsData: DataType = z.unknown()
export const GameOverData: DataType = z.object({ ordersCompleted: z.number() })

export const StartAction: Action = { action: "start", data: NoData }
export const GetStateAction: Action = { action: "get-state", data: NoData }
export const MoveAction: Action = { action: "move", data: MoveData }
export const PaintAction: Action = { action: "paint", data: PaintData }
export const AppendAction: Action = { action: "append", data: UnitData }
export const SubmitAction: Action = { action: "submit", data: UnitData }

export const StateEvent: Message = { event: "state", data: StateData }
export const UpdateUnitEvent: Message = { event: "update-unit", data: UpdateUnitData }
export const CompleteOrderEvent: Message = { event: "complete-order", data: CompleteOrderData }
export const NewOrderEvent: Message = { event: "new-order", data: NewOrderData }
export const GrantToolsEvent: Message = { event: "grant-tools", data: GrantToolsData }
export const GameOverEvent: Message = { event: "game-over", data: GameOverData }
