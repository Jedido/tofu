<template>
  <div class="bg-emerald-700" @mousedown="startDrag"></div>
</template>

<script>
import config from "@/assets/config.js"
import breakpoints from '@/mixins/breakpoints.js'

export default {
  name: "DragBar",
  mixins: [breakpoints],
  data() {
    return {
      dragging: false,
      dragX: 0,
      oldWidth: config.SIDEBAR_MIN_WIDTH,
      sidebarWidth: config.SIDEBAR_MIN_WIDTH,
      gameWidth: 0,
    }
  },
  mounted() {
    window.addEventListener("mouseup", () => {
      this.dragging = false
    })
    window.addEventListener("resize", () => {
      if (this.mobile) {
        this.$store.commit("setGameWidth", window.innerWidth)
      } else {
        if (window.innerWidth - this.$store.state.sidebarWidth <= config.GAME_MIN_WIDTH) {
          this.$store.commit("setGameWidth", config.GAME_MIN_WIDTH)
          this.$store.commit("setSidebarWidth", window.innerWidth - this.$store.state.gameWidth)
        } else {
          this.$store.commit("setGameWidth", window.innerWidth - this.$store.state.sidebarWidth)
        }
      }
    })
    console.log(this.mobile)
    document.addEventListener("mousemove", this.dragUpdate)
  },
  methods: {
    startDrag(e) {
      this.dragging = true
      this.oldWidth = this.$store.state.sidebarWidth
      this.dragX = e.clientX
    },
    dragUpdate(e) {
      if (!this.dragging) {
        return false
      }
      const dx = e.clientX - this.dragX
      const newGameWidth = window.innerWidth - this.oldWidth + dx
      if (newGameWidth >= config.GAME_MIN_WIDTH) {
        if (this.oldWidth - dx < config.SIDEBAR_MIN_WIDTH) {
          this.$store.commit("setSidebarWidth", config.SIDEBAR_MIN_WIDTH)
          this.$store.commit("setGameWidth", window.innerWidth - config.SIDEBAR_MIN_WIDTH)
        } else {
          this.$store.commit("setSidebarWidth", this.oldWidth - dx)
          this.$store.commit("setGameWidth", newGameWidth)
        }
      } else {
        this.$store.commit("setSidebarWidth", window.innerWidth - config.GAME_MIN_WIDTH)
        this.$store.commit("setGameWidth", config.GAME_MIN_WIDTH)
      }
    },
  },
}
</script>
