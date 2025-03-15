<template>
  <div class="bg-gray-600 px-2 py-1 w-full ml-auto mr-2 rounded-xl h-12 select-none">
    <div class="flex items-center justify-around">
      <i
        class="text-4xl"
        :class="{
          'bi-play-fill': paused,
          'bi-stop-fill': !paused,
          'text-gray-500': audioLoading,
          'text-amber-50 cursor-pointer': !audioLoading,
        }"
        @click="playAudio"
      ></i>
      <div class="text-amber-50 text-sm mx-2">{{ formatTime(currentTime) }} / 0:10</div>
      <input
        id="volume-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        class="w-12"
        v-model="volume"
        @input="adjustVolume"
      />
      <audio
        ref="audio"
        @loadedmetadata="metadataLoaded"
        @canplay="audioReady"
      >
        <source :src="track" type="audio/ogg">
        Your browser does not support the <code>audio</code> element.
      </audio>
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import breakpoints from "@/mixins/breakpoints.js"

export default {
  name: "AnidleGame",
  mixins: [socket, breakpoints],
  props: {
    start: Number,
    track: String,
    puzzle: Boolean
  },
  data() {
    return {
      volume: 0,
      audioLoading: true,
      paused: true,
      startTime: 0,
      currentTime: 0,
      duration: 0
    }
  },
  mounted() {
    this.volume = localStorage.getItem("audioVolume") || 20
    this.$refs.audio.volume = this.volume / 100

    // Update current time
    this.$refs.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.$refs.audio.currentTime - this.startTime
      if (this.currentTime > 10) {
        this.$refs.audio.pause()
        this.$refs.audio.currentTime = this.startTime
        this.paused = true
      }
    })
  },
  methods: {
    playAudio() {
      if (this.paused) {
        this.$refs.audio.play()
        this.paused = false
      } else {
        this.$refs.audio.pause()
        this.$refs.audio.currentTime = this.startTime
        this.paused = true
      }
    },
    adjustVolume() {
      this.$refs.audio.volume = this.volume / 100
      localStorage.setItem("audioVolume", this.volume)
    },
    metadataLoaded() {
      this.duration = this.$refs.audio.duration
      const totalTime = this.duration
      this.startTime = totalTime / 100 * this.start
      this.$refs.audio.currentTime = this.startTime
    },
    audioReady() {
      this.audioLoading = false
    },
    formatTime(seconds) {
      const secs = Math.floor(seconds)
      return `0:${secs.toString().padStart(2, '0')}`
    }
  },
}
</script>

<style scoped>
/* Style the range slider */
#volume-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: #ddd;
    border-radius: 5px;
    outline: none;
    transition: 0.2s;
}

/* Custom thumb (handle) for WebKit browsers */
#volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px; /* Smaller handle */
    height: 10px;
    background: #333;
    border-radius: 5px;
    cursor: pointer;
}

/* Custom thumb for Firefox */
#volume-slider::-moz-range-thumb {
    width: 10px; /* Smaller handle */
    height: 10px;
    background: #333;
    border-radius: 5px;
    cursor: pointer;
}
</style>
