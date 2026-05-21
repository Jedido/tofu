import { z } from "zod"
import type { DataType, Action, Message } from "../baseSpec.ts"

export const serviceName = "jeopardy"

export const NoData: DataType = z.unknown()
export const StartGameData: DataType = z.object({
  jeopardy: z.string(),
  local: z.boolean(),
})
export const AddPointsData: DataType = z.object({
  id: z.string(),
  points: z.union([z.number(), z.string()]),
})
export const DisplayQuestionData: DataType = z.object({
  category: z.string(),
  points: z.number(),
})
export const ShowSubmissionData: DataType = z.object({ show: z.boolean() })
export const SubmitData: DataType = z.object({ submission: z.string() })

export const PlayersData: DataType = z.array(
  z.object({ ign: z.string(), id: z.string(), points: z.number() })
)
export const HostData: DataType = z.object({
  id: z.string().nullable(),
  ign: z.string(),
})
export const CategoriesData: DataType = z.array(
  z.object({
    name: z.string(),
    questions: z.array(
      z.object({ points: z.number(), completed: z.boolean() })
    ),
  })
)
export const QuestionData: DataType = z.object({
  question: z.string(),
  answer: z.string(),
  points: z.number(),
  type: z.string().optional(),
})
export const QuestionStateData: DataType = z.number()
export const ToggleSubmissionData: DataType = z.boolean()
export const LocalData: DataType = z.boolean()
export const BuzzerData: DataType = z.string()

export const StartGameAction: Action = {
  action: "start-game",
  data: StartGameData,
}
export const SetPlayerAction: Action = { action: "set-player", data: NoData }
export const SetHostAction: Action = { action: "set-host", data: NoData }
export const AddPointsAction: Action = {
  action: "add-points",
  data: AddPointsData,
}
export const DisplayCategoriesAction: Action = {
  action: "display-categories",
  data: NoData,
}
export const DisplayQuestionAction: Action = {
  action: "display-question",
  data: DisplayQuestionData,
}
export const BuzzAction: Action = { action: "buzz", data: NoData }
export const NextRoundAction: Action = { action: "next-round", data: NoData }
export const ShowSubmissionAction: Action = {
  action: "show-submission",
  data: ShowSubmissionData,
}
export const SubmitAction: Action = { action: "submit", data: SubmitData }
export const GetSubmissionsAction: Action = {
  action: "get-submissions",
  data: NoData,
}
export const QuestionResetAction: Action = {
  action: "question-reset",
  data: NoData,
}
export const ClearBuzzerAction: Action = {
  action: "clear-buzzer",
  data: NoData,
}
export const QuestionNextAction: Action = {
  action: "question-next",
  data: NoData,
}
export const ShowAnswerAction: Action = { action: "show-answer", data: NoData }

export const UpdatePlayersEvent: Message = {
  event: "update-players",
  data: PlayersData,
}
export const UpdateHostEvent: Message = { event: "update-host", data: HostData }
export const ShowCategoriesEvent: Message = {
  event: "show-categories",
  data: CategoriesData,
}
export const ShowQuestionEvent: Message = {
  event: "show-question",
  data: QuestionData,
}
export const SetQuestionStateEvent: Message = {
  event: "set-question-state",
  data: QuestionStateData,
}
export const ToggleSubmissionEvent: Message = {
  event: "toggle-submission",
  data: ToggleSubmissionData,
}
export const SetLocalEvent: Message = { event: "set-local", data: LocalData }
export const BuzzerEvent: Message = { event: "buzzer", data: BuzzerData }
