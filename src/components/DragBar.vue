<template>
  <div class="bg-emerald-700" @mousedown="startDrag"></div>
</template>

<script>
export default {
  name: "DragBar",
  data() {
    return {
      dragging: false,
      dragX: 0,
      oldWidth: 300,
      sidebarWidth: 300,
      gameWidth: 0,
    }
  },
  mounted() {
    window.addEventListener("mouseup", () => {
      this.dragging = false
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
      this.$store.commit("setSidebarWidth", this.oldWidth - dx)
    },
  },
}
</script>
