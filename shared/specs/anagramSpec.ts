import { z } from "zod"
import { Action, DataType, Message } from "../baseSpec.ts"

export const serviceName = "anagram"

export const SettingsData: DataType = z.object({
  gameMode: z.string(),
  showAnswer: z.boolean(),
  oneshot: z.boolean(),
  strikes: z.union([z.number(), z.string()]),
  ciphers: z.union([z.number(), z.string()]),
  cipherTime: z.union([z.number(), z.string()]),
  timerType: z.string(),
  scoreLimit: z.union([z.number(), z.string()]),
  timeLimit: z.union([z.number(), z.string()]),
})
export const SubmitData: DataType = z.string()
export const PlayerData: DataType = z.object({
  id: z.string(),
  ign: z.string(),
})
export const PlayerResultData: DataType = z.object({
  ign: z.string(),
  score: z.number(),
  submissions: z.array(z.string()),
})
export const StartData: DataType = z.object({
  players: z.array(PlayerData),
  settings: SettingsData,
})
export const ResultData: DataType = z.object({
  answer: z.string().nullable(),
  timeout: z.boolean(),
})
export const UpdatePlayerData: DataType = z.object({
  playerId: z.string(),
  score: z.number(),
  strikes: z.number(),
})
export const CipherData: DataType = z.object({
  scrambled: z.string(),
  time: z.number(),
})
export const EndData: DataType = z.object({
  results: z.record(z.string(), PlayerResultData),
  ciphers: z.array(z.tuple([z.string(), z.string()])),
})

export const InitAction: Action = { action: "init", data: SettingsData }
export const SubmitAction: Action = { action: "submit", data: SubmitData }

export const StartEvent: Message = { event: "start", data: StartData }
export const ResultEvent: Message = { event: "result", data: ResultData }
export const UpdatePlayerEvent: Message = {
  event: "update-player",
  data: UpdatePlayerData,
}
export const CipherEvent: Message = { event: "cipher", data: CipherData }
export const EndEvent: Message = { event: "end", data: EndData }
