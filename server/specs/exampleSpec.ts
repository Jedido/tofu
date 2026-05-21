import { z } from "zod"
import { Action, DataType, Message } from "../baseSpec.ts"

export const serviceName = "example"

export const SendMessageData: DataType = z.string()
export const ReceiveMessageData: DataType = z.object({
  ign: z.string(),
  message: z.string(),
})

// Actions: client → server. Zod schemas validate incoming data at runtime
// and infer TypeScript types for handler parameters.
export const SendMessageAction: Action = {
  action: "send-message",
  data: SendMessageData,
}

// Events: server → client. TypeScript only — no runtime validation needed
// since the server controls what it broadcasts.
export const ReceiveMessageEvent: Message = {
  event: "receive-message",
  data: ReceiveMessageData,
}
