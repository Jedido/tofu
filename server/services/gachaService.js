const GameService = require("./gameService.js")

class GachaService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "example-send-message": this.sendMessage.bind(this),
    }
    // responses
    this.receiveMessage = "example-receive-message"
  }

  // sends message
  sendMessage(message, socket) {
    this.broadcastFn(this.receiveMessage, socket.ign, message)
  }
}
GachaService.prototype.id = "gacha"

module.exports = GachaService
