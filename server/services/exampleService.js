class ExampleService {
  constructor(broadcastFn) {
    this.broadcastFn = broadcastFn

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
ExampleService.prototype.id = "example"

module.exports = ExampleService
