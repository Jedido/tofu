import { z, ZodType } from "zod"
import { TSocket } from "../utils/tsocket.ts"
import { broadcast, players } from "../gameManager.ts"

abstract class GameService {
  id: string = ""

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

  sendLog(message: string, recipient?: TSocket): void {
    this.send("log", message, recipient)
  }

  join(socket: TSocket) {
    this.sendLog(`${socket.ign} has joined the room.`)
  }

  leave(socket: TSocket): void {
    broadcast(this.roomId, "log", `${socket.ign} has left the room.`)
  }

  parseDataAs<S extends ZodType>(schema: S, data: unknown): z.infer<S> {
    return schema.parse(data)
  }

  shutdown() {}

  abstract dispatch(action: string, data: unknown, socket: TSocket): void
}
GameService.prototype.id = "game"

export default GameService
