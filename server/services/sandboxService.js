const GameService = require("./gameService.js")

class SandboxService extends GameService {
  constructor(roomId) {
    super(roomId)
  }
}
SandboxService.prototype.id = "sandbox"

module.exports = SandboxService
