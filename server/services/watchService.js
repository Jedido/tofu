const GameService = require("./gameService.js")

class WatchService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "watch-load": this.loadVideo.bind(this),
      "watch-play": this.playVideo.bind(this),
      "watch-pause": this.pauseVideo.bind(this),
      "watch-jump": this.jumpVideo.bind(this),
      "watch-canplay": this.canPlay.bind(this),
    }
    // responses
    this.loadEvent = "watch-request-load"
    this.playEvent = "watch-request-play"
    this.pauseEvent = "watch-request-pause"
    this.jumpEvent = "watch-request-jump"
  }

  canPlay(_, socket) {
    this.broadcastFn("log", `${socket.ign} is ready`)
  }

  loadVideo({ url }, socket) {
    this.broadcastFn("log", `${socket.ign} loaded video ${url}`)
    this.broadcastFn(this.loadEvent, {
      url,
      type: `video/${url.substring(url.lastIndexOf(".") + 1)}`,
    })
  }

  playVideo() {
    this.broadcastFn(this.playEvent)
  }

  pauseVideo() {
    this.broadcastFn(this.pauseEvent)
  }

  jumpVideo(message) {
    this.broadcastFn(this.jumpEvent, message)
  }
}
WatchService.prototype.id = "watch"

module.exports = WatchService
