<template>
  <div id="watch" class="select-none text-amber-900">
    <p class="text-center text-3xl mb-4">Watch Together!</p>
    <div
      class="
        flex flex-col
        items-center
        bg-amber-100
        rounded
        mt-auto
        border-4 border-amber-200
        mx-10
      "
    >
      <div class="h-full p-4 w-full overflow-y-auto leading-4 text-sm">
        <video id="watch-video" class="w-full" controls preload="none">
          <source v-if="videoUrl" :src="videoUrl" :type="videoType" />
        </video>
      </div>
      <div class="grid grid-cols-6 w-full border-t-2 border-amber-200">
        <input
          v-model="url"
          type="text"
          id="input"
          class="outline-none bg-amber-50 px-4 py-2 col-span-5"
          autocomplete="off"
          placeholder="Enter a video file URL..."
        />
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg"
          @click="load()"
        >
          Load Video
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"

export default {
  name: "WatchGame",
  mixins: [socket],
  data() {
    return {
      url: "",
      blobUrl: "",
      videoUrl: "",
      videoType: "",
      isPlaying: false,
    }
  },
  mounted() {
    const video = document.getElementById("watch-video")
    video.volume = localStorage.getItem("videoVolume") || 1
    this.on("request-load", ({ url, type }) => {
      this.videoUrl = url
      this.videoType = type
      video.preload = "auto"
      video.load()
    })
    this.on("request-jump", ({ time }) => {
      console.log(`jump to ${time}`)
      video.currentTime = time
    })
    this.on("request-play", () => {
      console.log("play")
      video.play()
    })
    this.on("request-pause", () => {
      console.log("pause")
      video.pause()
    })

    video.addEventListener("canplaythrough", () => {
      this.emit("canplay")
    })
    video.addEventListener("play", () => {
      this.emit("play")
    })
    video.addEventListener("pause", () => {
      this.emit("pause")
    })
    video.addEventListener("waiting", () => {
      this.emit("pause")
    })
    video.addEventListener("seeked", () => {
      this.emit("pause")
      this.emit("jump", { time: video.currentTime })
    })
    video.addEventListener("volumechange", () => {
      localStorage.setItem("videoVolume", video.volume)
    })
  },
  unmounted() {
    // document.getElementById("watch-video").pause()
    //https://v.animethemes.moe/BangDreamItsMyGO-ED1.webm
  },
  methods: {
    load() {
      this.emit("load", { url: this.url })
      this.url = ""
    },
  },
}
</script>

<style scoped></style>
