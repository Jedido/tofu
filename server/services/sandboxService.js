import GameService from "./gameService.js"

class SandboxService extends GameService {
  constructor(roomId) {
    super(roomId)
  }
}
SandboxService.prototype.id = "sandbox"

export default SandboxService
