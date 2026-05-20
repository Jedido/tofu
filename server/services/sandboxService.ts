import GameService from "./gameService.ts"

class SandboxService extends GameService {
  constructor(roomId: string) {
    super(roomId)
  }
}
SandboxService.prototype.id = "sandbox"

export default SandboxService
