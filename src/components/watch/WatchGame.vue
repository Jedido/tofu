<template>
  <div id="watch" class="select-none text-amber-900 overflow-x-hidden">
    <h1 v-if="this.md" class="text-center text-3xl mb-4">Watch Together!</h1>
    <div
      class="
        flex flex-col
        items-center
        bg-amber-100
        rounded
        mt-auto
        mx-auto
        w-fit
      "
    >
      <div v-if="!this.youtube" :style="{
        width: `${videoWidth}px`,
        height: `${videoHeight}px`
      }"></div>
      <div id="youtube"></div>
      <form class="grid grid-cols-6 w-full border-2 border-amber-200 border-box" @submit.prevent="submit()">
        <input
          v-model="url"
          type="text"
          id="input"
          class="outline-none bg-amber-50 px-4 py-2 col-span-4"
          autocomplete="off"
          placeholder="Enter a youtube URL or query..."
          :disabled="!isReady"
        />
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg disabled:bg-gray-300"
          :disabled="!isReady"
        >
          Submit
        </button>
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg disabled:bg-gray-300"
          @click.prevent="sync()"
          :disabled="!isReady"
        >
          Sync
        </button>
      </form>
    </div>
    <div class="flex flex-col gap-2 mx-auto">
      <div class="text-xl mt-4 flex justify-center gap-8">
        <h3 class="cursor-pointer" :class="{ 'underline': !showResults }" @click="showResults = false">Playlist</h3>
        <h3 class="cursor-pointer" :class="{ 'underline': showResults }" @click="showResults = true">Search</h3>
      </div>
      <div
        v-if="!showResults"
        v-for="(video, index) in playlist"
        class="relative w-fit mx-auto"
      >
        <VideoCard
          v-bind="video"
          @click="start(video)"
        />
        <button class="
          delete-button
          absolute
          h-6 w-6 rounded
          border-error border-2 border-box
          text-error hover:bg-error hover:text-white"
          @click="remove(index)"
        >
          ✖
        </button>
      </div>
      <VideoCard
        v-else
        v-for="result in searchResults"
        v-bind="result" 
        @click="queue(result)"
      />
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import breakpoints from "@/mixins/breakpoints.js"
import VideoCard from "./VideoCard.vue"

export default {
  name: "WatchGame",
  mixins: [socket, breakpoints],
  components: {
    VideoCard
  },
  data() {
    return {
      youtube: null,
      url: "",
      isReady: false,
      showResults: false,
      currentlyPlaying: "",
      searchResults: [],
      playlist: [],
      paused: true,
      time: 0
    }
  },
  mounted() {
    let scripts = Array
      .from(document.querySelectorAll('script'))
      .map(scr => scr.src);

    if (!scripts.includes('https://www.youtube.com/iframe_api')) {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = this.setupYoutube
    } else {
      this.setupYoutube()
    }
    this.on("request-queue", ({ video }) => {
      this.playlist.push(video)
    })
    this.on("request-start", ({ videoId }) => {
      this.currentlyPlaying = videoId
      this.youtube.cueVideoById(videoId)
      this.paused = true
    })
    this.on("request-sync", ({ time, pause }) => {
      this.youtube.seekTo(time)
      this.paused = pause
      if (pause) {
        this.youtube.pauseVideo()
      } else if (this.youtube.getPlayerState() !== 1) {
        this.youtube.playVideo()
      }
    })
    this.on("request-pause", () => {
      this.youtube.pauseVideo()
    })
    this.on("search-results", ({ results }) => {
      this.searchResults = results
    })
    this.on("request-remove", ({ index }) => {
      this.playlist.splice(index, 1)
    })
    this.on("state", ({ videoId, playlist, time, paused }) => {
      this.playlist = playlist
      this.currentlyPlaying = videoId
      this.paused = paused
      if (videoId) {
        if (time > 0) {
          this.youtube.loadVideoById(videoId, time)
        }
        if (paused) {
          this.youtube.pauseVideo()
        }
      }
    })
  },
  unmounted() {
    this.youtube.destroy()
  },
  methods: {
    setupYoutube() {
      this.youtube = new YT.Player('youtube', {
        width: this.videoWidth,
        height: this.videoHeight,
        videoId: '',
        playerVars: {
          "playsinline": 1
        },
        events: {
          onReady: this.ready,
          onStateChange: this.stateChange
        },
      })
    },
    submit() {
      if (!this.url) {
        return
      }
      if (URL.canParse(this.url)) {
        const parsedURL = URL.parse(this.url)
        const id = parsedURL.searchParams.get("v")
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch%3Fv=${id}&format=json`)
          .then(res => res.json())
          .then(json => {
            this.queue({
              title: json.title,
              channel: json.author_name,
              videoId: id
            })
          })
        this.url = ""
        this.showResults = false
      } else {
        this.emit("search", { query: this.url })
        this.showResults = true
        this.searchResults = []
        this.url = ""
      }
    },
    sync() {
      this.emit("sync", { time: this.youtube.getCurrentTime(), pause: this.youtube.getPlayerState() === 2 })
    },
    stateChange(event) {
      if (event.data === 1 && this.paused) {
        this.paused = false
        this.emit("sync", { time: this.youtube.getCurrentTime() })
      } else if (event.data === 2) {
        this.paused = true
        this.emit("pause")
      }
    },
    queue(video) {
      this.showResults = false
      this.emit("queue", { video })
    },
    start(video) {
      this.emit("start", { videoId: video.videoId })
    },
    ready() {
      this.isReady = true
      this.emit("get-state")
    },
    remove(index) {
      this.emit("remove", { index })
    }
  },
  computed: {
    videoWidth() {
      if (this.md) {
        return 640
      } else {
        return this.$store.state.gameWidth + 2
      }
    },
    videoHeight() {
      return this.videoWidth * 9 / 16
    }
  },
  watch: {
    videoWidth(newVal, _) {
      if (this.youtube) {
        this.youtube.setSize(newVal, this.videoHeight)
      }
    }
  }
}
</script>

<style scoped>
.delete-button {
  top: 50%;
  right: -48px;
  transform: translate(-50%, -50%);
  line-height: 100%;
  transition: background-color linear 0.2s;
  transition: color linear 0.2s;
}
</style>
