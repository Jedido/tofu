import type { ZodType } from "zod"

// Marks a const as a Zod schema — used by the generator to identify data type declarations
export type DataType = ZodType

// Declares an action (client → server)
export type Action = {
  action: string
  data: DataType
}

// Declares an event (server → client)
export type Message = {
  event: string
  data: DataType
}
