import { TSocket } from "../utils/tsocket.ts"
import GameService from "./gameService.ts"

class ExampleService extends GameService {
  readonly receiveMessage: string

  constructor(roomId: string) {
    super(roomId)

    // requests
    this.actions = {
      "example-send-message": this.sendMessage.bind(this),
    }
    // responses
    this.receiveMessage = "example-receive-message"
  }

  // sends message
  sendMessage(message: string, socket: TSocket) {
    this.broadcastFn(this.receiveMessage, socket.ign, message)
  }
}
ExampleService.prototype.id = "example"

export default ExampleService
