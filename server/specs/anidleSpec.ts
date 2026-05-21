import { z } from "zod"
import type { DataType, Action, Message } from "../baseSpec.ts"

export const serviceName = "anidle"

export const GuessData: DataType = z.object({
  mal_id: z.number(),
  title: z.string(),
})
export const NoData: DataType = z.unknown()
export const QueryData: DataType = z.string()
export const StartData: DataType = z
  .object({
    maxPopularity: z.number(),
    themeType: z.union([z.literal("ALL"), z.literal("OP"), z.literal("ED")]),
  })
  .nullish()
export const LoadingData: DataType = z.null()
export const RevealedData: DataType = z.object({
  source: z.string(),
  correctGenres: z.array(z.string()),
  incorrectGenres: z.array(z.string()),
  popularityMin: z.number().optional(),
  popularityMax: z.number().optional(),
  rankMin: z.number().optional(),
  rankMax: z.number().optional(),
  scoreMin: z.number().optional(),
  scoreMax: z.number().optional(),
  airedStartMin: z.unknown().optional(),
  airedStartMax: z.unknown().optional(),
  airedEndMin: z.unknown().optional(),
  airedEndMax: z.unknown().optional(),
})
export const GuessInfoData: DataType = z.object({
  mal_id: z.number(),
  title: z.string(),
  user: z.string(),
  correct: z.boolean().optional(),
  image_url: z.string().optional(),
})
export const InitGameData: DataType = z.object({
  synopsis: z.string(),
  audioClue: z.unknown(),
  revealedData: RevealedData,
})
export const GuessResultEventData: DataType = z.object({
  revealedData: RevealedData,
  guess: GuessInfoData,
  revealIndices: z.array(z.number()),
})
export const RepeatGuessData: DataType = z.object({ name: z.number() })
export const AutocompleteResultData: DataType = z.object({
  options: z.array(z.unknown()),
  query: z.string(),
})
export const WinData: DataType = z.object({ title: z.string() })

export const StartAction: Action = { action: "start", data: StartData }
export const GuessAction: Action = { action: "guess", data: GuessData }
export const AutocompleteAction: Action = {
  action: "autocomplete",
  data: QueryData,
}
export const GetStateAction: Action = { action: "get-state", data: NoData }

export const LoadingEvent: Message = { event: "loading", data: LoadingData }
export const InitGameEvent: Message = {
  event: "init-game",
  data: InitGameData,
}
export const GuessStartEvent: Message = {
  event: "guess-start",
  data: GuessInfoData,
}
export const GuessResultEvent: Message = {
  event: "guess-result",
  data: GuessResultEventData,
}
export const RepeatGuessEvent: Message = {
  event: "repeat-guess",
  data: RepeatGuessData,
}
export const AutocompleteResultEvent: Message = {
  event: "autocomplete-result",
  data: AutocompleteResultData,
}
export const WinEvent: Message = { event: "win", data: WinData }
