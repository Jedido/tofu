import {
  WatchServiceBase,
  type VideoItemData,
  type QueueVideoData,
  type VideoIdData,
  type SyncData,
  type SearchVideoData,
  type RemoveVideoData,
  type GetStateData,
  type TSocket,
} from "./watchServiceBase.ts"

export default class extends WatchServiceBase {
  playlist: VideoItemData[] = []
  currentVideo = ""
  time = 0
  startTime = 0
  paused = false
  waitingNextVideo: ReturnType<typeof setTimeout> | null = null

  private doStart(videoId: string) {
    if (this.waitingNextVideo) clearTimeout(this.waitingNextVideo)
    this.currentVideo = videoId
    this.sendRequestStart({ videoId })
    this.paused = false
  }

  private doRemove(index: number) {
    this.playlist.splice(index, 1)
    this.sendRequestRemove({ index })
  }

  private buildState() {
    const time =
      this.time + (this.paused ? 0 : Date.now() - this.startTime / 100)
    return {
      videoId: this.currentVideo,
      playlist: this.playlist,
      paused: this.paused,
      time,
    }
  }

  queueVideoAction({ video }: QueueVideoData, sender: TSocket) {
    if (this.playlist.find((v) => v.videoId === video.videoId)) {
      sender.emit("alert", "This video is already queued!")
      return
    }
    this.playlist.push(video)
    this.sendLog(`${sender.ign} queued a video: ${video.title}`)
    this.sendRequestQueue({ video })
    if (!this.currentVideo) this.doStart(video.videoId)
  }

  startVideoAction({ videoId }: VideoIdData, _sender: TSocket) {
    this.doStart(videoId)
  }

  syncVideoAction({ time, pause }: SyncData, _sender: TSocket) {
    if (!pause) this.startTime = Date.now()
    this.time = time
    this.paused = pause
    this.sendRequestSync({ time, pause })
  }

  nextVideoAction({ videoId }: VideoIdData, sender: TSocket) {
    if (this.waitingNextVideo) return
    const index = this.playlist.findIndex((v) => v.videoId === videoId)
    if (this.currentVideo !== videoId || index < 0) {
      this.sendState(this.buildState(), sender)
      return
    }
    this.waitingNextVideo = setTimeout(() => {
      this.time = 0
      this.startTime = Date.now()
      this.paused = false
      this.doRemove(index)
      if (this.playlist.length > index)
        this.doStart(this.playlist[index].videoId)
      this.waitingNextVideo = null
    }, 3000)
  }

  searchVideoAction({ query }: SearchVideoData, sender: TSocket) {
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${process.env.YOUTUBE_API_KEY}`
    )
      .then((res) => res.json())
      .then(
        (json: {
          items: Array<{
            id: { videoId: string }
            snippet: { title: string; channelTitle: string }
          }>
        }) => {
          const results = json.items.map((video) => ({
            videoId: video.id.videoId,
            title: video.snippet.title,
            channel: video.snippet.channelTitle,
          }))
          this.sendSearchResults({ results }, sender)
        }
      )
      .catch((e: unknown) => {
        console.log(`${sender.ign} failed to execute: ${e}`)
        console.log((e as Error).stack)
      })
  }

  removeVideoAction({ index }: RemoveVideoData, _sender: TSocket) {
    this.doRemove(index)
  }

  getStateAction(_data: GetStateData, sender: TSocket) {
    this.sendState(this.buildState(), sender)
  }
}
