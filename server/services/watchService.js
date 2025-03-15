const GameService = require("./gameService.js")

class WatchService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "watch-queue": this.queueVideo.bind(this),
      "watch-start": this.startVideo.bind(this),
      "watch-sync": this.syncVideo.bind(this),
      "watch-next": this.nextVideo.bind(this),
      "watch-search": this.searchVideo.bind(this),
      "watch-remove": this.removeVideo.bind(this),
      "watch-get-state": this.getState.bind(this)
    }
    // responses
    this.queueEvent = "watch-request-queue"
    this.startEvent = "watch-request-start"
    this.syncEvent = "watch-request-sync"
    this.pauseEvent = "watch-request-pause"
    this.removeEvent = "watch-request-remove"
    this.searchResultsEvent = "watch-search-results"
    this.stateEvent = "watch-state"

    this.playlist = []
    this.currentVideo = ""
    this.time = 0
    this.startTime = 0
    this.paused = false
    this.waitingNextVideo = null
  }

  getState(_, socket) {
    const time = this.time + (this.paused ? 0 : Date.now() - this.startTime / 100)
    socket.emit(this.stateEvent, {
      videoId: this.currentVideo,
      playlist: this.playlist,
      paused: this.paused,
      time
    })
  }

  queueVideo({ video }, socket) {
    if (this.playlist.find(v => v.videoId === video.videoId)) {
      socket.emit("alert", "This video is already queued!")
      return
    }
    this.playlist.push(video)
    this.broadcastFn("log", `${socket.ign} queued a video: ${video.title}`)
    this.broadcastFn(this.queueEvent, { video })
    if (!this.currentVideo) {
      this.currentVideo = video.videoId
      this.broadcastFn(this.startEvent, { videoId: video.videoId })
    }
  }

  searchVideo({ query }, socket) {
    try {
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        const results = json.items.map(video => {
          return {
            videoId: video.id.videoId,
            title: video.snippet.title,
            channel: video.snippet.channelTitle
          }
        })
        socket.emit(this.searchResultsEvent, { results })
      })
    } catch (e) {
      console.log(`${socket.ign} failed to execute: ${e}`)
      console.log(e.stack)
    }
  }

  startVideo({ videoId }) {
    if (this.waitingNextVideo) {
      clearTimeout(this.waitingNextVideo)
    }
    this.currentVideo = videoId
    this.broadcastFn(this.startEvent, { videoId })
    this.paused = false
  }

  syncVideo({ time, pause }) {
    if (!pause) {
      this.startTime = Date.now()
    }
    this.time = time
    this.paused = pause
    this.broadcastFn(this.syncEvent, { time, pause })
  }

  nextVideo({ videoId }, socket) {
    if (this.waitingNextVideo) {
      return
    }
    const index = this.playlist.findIndex((v) => v.videoId === videoId)
    if (this.currentVideo !== videoId || index < 0) {
      this.getState(null, socket)
      return
    }
    this.waitingNextVideo = setTimeout(() => {
      this.time = 0
      this.startTime = Date.now()
      this.paused = false
      this.removeVideo({ index })
      if (this.playlist.length > index) {
        const videoId = this.playlist[index].videoId
        this.startVideo({ videoId })
      }
      this.waitingNextVideo = null
    }, 3000)
  }

  removeVideo({ index }) {
    this.playlist.splice(index, 1)
    this.broadcastFn(this.removeEvent, { index })
  }
}
WatchService.prototype.id = "watch"

module.exports = WatchService
