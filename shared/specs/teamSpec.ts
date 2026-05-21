import { z } from "zod"
import type { DataType, Action, Message } from "../baseSpec.ts"

export const serviceName = "team"

export const NoData: DataType = z.unknown()
export const SubmissionData: DataType = z.object({
  type: z.string(),
  id: z.number(),
  data: z.unknown(),
  stack: z.number(),
})
export const WireCutData: DataType = z.object({ next: z.number() })

export const StartEventData: DataType = z.unknown()
export const FailData: DataType = z.object({ id: z.number(), stack: z.number() })
export const SolveData: DataType = z.object({ id: z.number() })
export const CutSuccessData: DataType = z.object({
  next: z.number(),
  success: z.boolean(),
})
export const LoseData: DataType = z.object({ cause: z.string() })
export const WinData: DataType = z.null()

export const StartAction: Action = { action: "start", data: NoData }
export const SubmitAction: Action = { action: "submit", data: SubmissionData }
export const CutAction: Action = { action: "cut", data: WireCutData }
export const NextAction: Action = { action: "next", data: NoData }
export const StateAction: Action = { action: "state", data: NoData }

export const StartEvent: Message = { event: "start", data: StartEventData }
export const FailEvent: Message = { event: "fail", data: FailData }
export const SolveEvent: Message = { event: "solve", data: SolveData }
export const CutSuccessEvent: Message = { event: "cut-success", data: CutSuccessData }
export const LoseEvent: Message = { event: "lose", data: LoseData }
export const WinEvent: Message = { event: "win", data: WinData }
