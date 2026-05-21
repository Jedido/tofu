import { z, ZodType } from "zod"
import { TSocket } from "../utils/tsocket.ts"
import { broadcast, players } from "../gameManager.ts"

type ActionHandler = (data: any, socket: TSocket) => void | Promise<void>

class GameService {
  id: string = ""
  actions: Record<string, ActionHandler> = {}

  // Fields used by subclasses
  currentActor?: number
  stateEvent?: string
  playerSockets?: Map<string, TSocket>
  roomId: string

  constructor(roomId: string) {
    this.roomId = roomId
  }

  getPlayers(): TSocket[] {
    return players(this.roomId)
  }

  getPlayer(id: string): TSocket | undefined {
    return this.getPlayers().find((socket) => socket.id === id)
  }

  send(event: string, data: unknown, recipient?: TSocket): void {
    if (!recipient) {
      broadcast(this.roomId, event, data)
    } else {
      recipient.emit(event, data)
    }
  }

  broadcastFn(...args: any[]): void {
    broadcast(this.roomId, ...args)
  }

  join(socket: TSocket) {
    this.broadcastFn("log", `${socket.ign} has joined the room.`)
  }

  leave(socket: TSocket) {
    broadcast(this.roomId, "log", `${socket.ign} has left the room.`)
  }

  parseDataAs<S extends ZodType>(schema: S, data: unknown): z.infer<S> {
    return schema.parse(data)
  }

  shutdown() {}
}
GameService.prototype.id = "game"

export default GameService
