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
      let targetSidebarWidth = this.oldWidth - dx
      if (targetSidebarWidth < config.SIDEBAR_MIN_WIDTH) {
        targetSidebarWidth = config.SIDEBAR_MIN_WIDTH
      } else if (window.innerWidth - targetSidebarWidth < config.GAME_MIN_WIDTH) {
        targetSidebarWidth = window.innerWidth - config.GAME_MIN_WIDTH
      }
      this.$store.commit("setSidebarWidth", targetSidebarWidth)
      this.$store.commit("setGameWidth", window.innerWidth - targetSidebarWidth)
    },
  },
}
</script>
