import { TSocket } from "../utils/tsocket.ts"
import GameService from "./gameService.ts"

interface VideoItem {
  videoId: string
  title: string
  channel: string
}

class WatchService extends GameService {
  readonly queueEvent: string
  readonly startEvent: string
  readonly syncEvent: string
  readonly pauseEvent: string
  readonly removeEvent: string
  readonly searchResultsEvent: string
  readonly stateEvent: string

  playlist: VideoItem[]
  currentVideo: string
  time: number
  startTime: number
  paused: boolean
  waitingNextVideo: ReturnType<typeof setTimeout> | null

  constructor(roomId: string) {
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

  getState(_: any, socket: TSocket) {
    const time = this.time + (this.paused ? 0 : Date.now() - this.startTime / 100)
    socket.emit(this.stateEvent, {
      videoId: this.currentVideo,
      playlist: this.playlist,
      paused: this.paused,
      time
    })
  }

  queueVideo({ video }: { video: VideoItem }, socket: TSocket) {
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

  searchVideo({ query }: { query: string }, socket: TSocket) {
    try {
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(res => res.json())
      .then((json: any) => {
        const results = json.items.map((video: any) => {
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
      console.log((e as Error).stack)
    }
  }

  startVideo({ videoId }: { videoId: string }) {
    if (this.waitingNextVideo) {
      clearTimeout(this.waitingNextVideo)
    }
    this.currentVideo = videoId
    this.broadcastFn(this.startEvent, { videoId })
    this.paused = false
  }

  syncVideo({ time, pause }: { time: number; pause: boolean }) {
    if (!pause) {
      this.startTime = Date.now()
    }
    this.time = time
    this.paused = pause
    this.broadcastFn(this.syncEvent, { time, pause })
  }

  nextVideo({ videoId }: { videoId: string }, socket: TSocket) {
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
        const nextVideoId = this.playlist[index].videoId
        this.startVideo({ videoId: nextVideoId })
      }
      this.waitingNextVideo = null
    }, 3000)
  }

  removeVideo({ index }: { index: number }) {
    this.playlist.splice(index, 1)
    this.broadcastFn(this.removeEvent, { index })
  }
}
WatchService.prototype.id = "watch"

export default WatchService
