const GameService = require("./gameService.js")
const https = require('https');

class WatchService extends GameService {
  constructor(roomId) {
    super(roomId)

    // requests
    this.actions = {
      "watch-load": this.loadVideo.bind(this),
      "watch-play": this.playVideo.bind(this),
      "watch-pause": this.pauseVideo.bind(this),
      "watch-jump": this.jumpVideo.bind(this),
      "watch-search": this.searchVideo.bind(this)
    }
    // responses
    this.loadEvent = "watch-request-load"
    this.playEvent = "watch-request-play"
    this.pauseEvent = "watch-request-pause"
    this.jumpEvent = "watch-request-jump"
    this.searchResultsEvent = "watch-search-results"
  }

  loadVideo({ id }, socket) {
    try {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch%3Fv=${id}&format=json`)
        .then(res => res.json())
        .then(json => {
          this.broadcastFn("log", `${socket.ign} added video: ${json.title}`)
          this.broadcastFn(this.loadEvent, { id })
        })
    } catch (e) {
      console.log(`${socket.ign} failed to execute: ${e}`)
      console.log(e.stack)
    }
  }

  searchVideo({ query }, socket) {
    try {
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(res => res.json())
      .then(json => {
        const results = json.items.map(video => {
          console.log(video.snippet)
          return {
            id: video.id.videoId,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.medium.url, // default, high
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

  playVideo() {
    this.broadcastFn(this.playEvent)
  }

  pauseVideo() {
    this.broadcastFn(this.pauseEvent)
  }

  jumpVideo({ time }) {
    this.broadcastFn(this.jumpEvent, { time })
  }
}
WatchService.prototype.id = "watch"

module.exports = WatchService
