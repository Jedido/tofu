import { z } from "zod"
import { Action, DataType, Message } from "../baseSpec.ts"

export const serviceName = "gacha"

export const NoData: DataType = z.unknown()
export const RecruitData: DataType = z.object({ index: z.number() })
export const GachaUnitData: DataType = z.record(z.string(), z.unknown())
export const StartData: DataType = z.array(z.number())
export const RecruitResultData: DataType = z.object({
  index: z.number(),
  character: GachaUnitData,
})
export const SummaryData: DataType = z.record(z.string(), z.unknown())
export const StatsData: DataType = z.object({
  history: z.array(GachaUnitData),
  pity: z.number(),
})

export const StartRecruitAction: Action = {
  action: "start-recruit",
  data: NoData,
}
export const RecruitAction: Action = { action: "recruit", data: RecruitData }
export const EndRecruitAction: Action = {
  action: "end-recruit",
  data: NoData,
}
export const GetStatsAction: Action = { action: "get-stats", data: NoData }

export const StartEvent: Message = { event: "start", data: StartData }
export const RecruitResultEvent: Message = {
  event: "recruit-result",
  data: RecruitResultData,
}
export const SummaryEvent: Message = { event: "summary", data: SummaryData }
export const StatsEvent: Message = { event: "stats", data: StatsData }
