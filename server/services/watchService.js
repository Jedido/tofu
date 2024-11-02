const GameService = require("./gameService.js")
const https = require('https');

class WatchService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "watch-queue": this.queueVideo.bind(this),
      "watch-start": this.startVideo.bind(this),
      "watch-sync": this.syncVideo.bind(this),
      "watch-pause": this.pauseVideo.bind(this),
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
    this.currentVideo = videoId
    this.broadcastFn(this.startEvent, { videoId })
    this.paused = true
  }

  syncVideo({ time, pause }) {
    if (!this.startTime && !pause) {
      this.startTime = Date.now()
    }
    this.time = time
    this.paused = pause
    this.broadcastFn(this.syncEvent, { time, pause })
  }

  pauseVideo() {
    this.time += (Date.now() - this.startTime) / 1000
    this.startTime = 0
    this.paused = true
    this.broadcastFn(this.pauseEvent)
  }

  removeVideo({ index }) {
    this.playlist.splice(index, 1)
    this.broadcastFn(this.removeEvent, { index })
  }
}
WatchService.prototype.id = "watch"

module.exports = WatchService
