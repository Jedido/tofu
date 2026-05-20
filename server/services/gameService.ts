import { TSocket } from "../utils/tsocket.ts"
import { broadcast, players } from "../gameManager.ts"

type ActionHandler = (data: any, socket: TSocket) => void | Promise<void>

class GameService {
  id: string = ""
  actions: Record<string, ActionHandler> = {}
  broadcastFn: (type: string, ...args: any[]) => void
  getPlayers: () => TSocket[]
  getPlayer: (id: string) => TSocket | undefined

  // Fields used by subclasses
  record?: any[]
  enemy?: any
  currentActor?: number
  stateEvent?: string
  playerSockets?: Map<string, TSocket>

  constructor(roomId: string) {
    this.getPlayers = () => players(roomId)
    this.getPlayer = (id: string) =>
      this.getPlayers().find((socket) => socket.id === id)
    this.broadcastFn = (...args: any[]) => {
      broadcast(roomId, ...args)
    }
  }

  join(socket: TSocket) {
    this.broadcastFn("log", `${socket.ign} has joined the room.`)
  }

  leave(socket: TSocket) {
    this.broadcastFn("log", `${socket.ign} has left the room.`)
  }
}

export default GameService
