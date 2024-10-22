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
      <div id="youtube"></div>
      <form class="grid grid-cols-6 w-full border-2 border-amber-200 border-box" @submit.prevent="submit()">
        <input
          v-model="url"
          type="text"
          id="input"
          class="outline-none bg-amber-50 px-4 py-2 col-span-4"
          autocomplete="off"
          placeholder="Enter a youtube URL or query..."
        />
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg"
        >
          Submit
        </button>
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg"
          @click.prevent="sync()"
        >
          Sync
        </button>
      </form>
    </div>
    <div v-show="searchResults.length > 0" class="flex flex-col gap-2 mx-auto">
      <h3 class="text-center text-xl mt-4">Results</h3>
      <div 
        v-for="result in searchResults" 
        class="search-result grid grid-cols-2 gap-2 cursor-pointer bg-white mx-auto"
        @click="() => load(result.id)"
      >
        <img class="row-span-2" :src="result.thumbnail" />
        <div class="flex flex-col gap-2 pr-2 pt-2">
          <p class="overflow-y-auto max-h-20">{{ result.title }}</p>
          <p class="text-xs ml-auto">by <strong>{{ result.channel }}</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import breakpoints from "@/mixins/breakpoints.js"

export default {
  name: "WatchGame",
  mixins: [socket, breakpoints],
  data() {
    return {
      youtube: null,
      url: "",
      ready: false,
      searchResults: []
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
    } else {
      document.getElementById('youtube').replaceWith(window.youtube.g)
    }

    window.onYouTubeIframeAPIReady = () => {
      window.youtube = new YT.Player('youtube', {
        width: this.videoWidth,
        height: this.videoHeight,
        videoId: '',
        playerVars: {
          "playsinline": 1
        },
        events: {
          onReady: () => this.ready = true,
          onStateChange: this.stateChange
        }
      })
    }
    this.on("request-load", ({ id }) => {
      window.youtube.cueVideoById(id)
    })
    this.on("request-jump", ({ time }) => {
      window.youtube.seekTo(time)
    })
    this.on("request-play", () => {
      window.youtube.playVideo()
    })
    this.on("request-pause", () => {
      window.youtube.pauseVideo()
    })
    this.on("search-results", ({ results }) => {
      this.searchResults = results
    })
  },
  methods: {
    submit() {
      if (URL.canParse(this.url)) {
        const parsedURL = URL.parse(this.url)
        const id = parsedURL.searchParams.get("v")
        if (!!id && parsedURL.host === "www.youtube.com") {
          this.load(id)
        } else {
          alert("video could not be found!")
        }
      } else {
        this.emit("search", { query: this.url })
        this.url = ""
      }
    },
    sync() {
      this.emit("jump", { time: window.youtube.getCurrentTime() })
    },
    stateChange(event) {
      if (event.data === 1) {
        this.emit("play")
      } else if (event.data === 2) {
        this.emit("pause")
      }
    },
    load(id) {
      this.emit("load", { id })
      this.url = ""
    },
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
      window.youtube.setSize(newVal, this.videoHeight)
    }
  }
}
</script>

<style scoped>
.search-result {
  max-width: 480px;
}
</style>
