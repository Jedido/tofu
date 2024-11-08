<template>
  <div class="relative text-gray-50 max-w-64">
    <div
      ref="panel" 
      class="submit-wrapper relative z-10 px-2 rounded flex flex-col justify-between w-64 h-96" 
      :class="[panelType === 'p' ? `bg-cyan-800` : (panelType === 'd' ? 'bg-gray-500' : 'bg-gray-800')]"
      @mousedown.prevent="mouseStart"
    >
      <div class="text-lg h-8 text-center py-1 relative">
        <slot name="title"></slot>
      </div>
      <div class="bg-white h-60 w-60 relative rounded-lg mx-auto text-gray-800">
        <slot name="content"></slot>
      </div>
      <div 
        class="rounded h-24 relative mx-1 my-2"
        :class="[panelType === 'p' ? `bg-cyan-700` : (panelType === 'd' ? 'bg-gray-400' : 'bg-gray-700')]"
        @touchstart="touchStart"
        @contextmenu.prevent="submit"
      >
        <div class="text-sm px-2 py-1 text-gray-50 leading-tight">
          <slot name="description"></slot>
        </div>
      </div>
    </div>
    <div
      style="height:384px;"
      class="send-confirm w-full text-center text-amber-50 absolute bottom-0 pt-0 rounded overflow-hidden"
      :class="{
        'bg-cyan-400': status === 'pending',
        'bg-emerald-500': status === 'success',
        'bg-error': status === 'failure'
      }"
      @mousedown.prevent="dismiss"
      @touchstart.prevent="dismiss"
      >
      <div ref="send" class="absolute send-icon left-0 right-0" v-show="dragging">
        <i class="bi-chevron-double-up"></i>
      </div>
      <span v-if="sending" class="absolute bottom-1/2 left-0 right-0 translate-y-2/4 large-icon">
        <i v-if="status === 'pending'" class="bi-three-dots"></i>
        <i v-else-if="status === 'failure'" class="bi-x-circle-fill"></i>
        <i v-else class="bi-check-circle-fill"></i>
      </span>
    </div>
  </div>
</template>

<script>

export default {
  name: "Panel",
  props: {
    active: Boolean,
    panelType: String,
    status: {
      type: String,
      default: 'pending'
    }
  },
  data() {
    return {
      dragging: false,
      currentOffset: 0,
      startPos: 0,
      startTime: 0,
      sending: false
    }
  },
  methods: {
    start(e, y) {
      if (!this.active || this.panelType === 'd') {
        return false
      }
      e.preventDefault()
      this.dragging = true
      this.startPos = y
      return true
    },
    touchStart(e) {
      if (this.start(e, e.touches[0].clientY)) {
        document.addEventListener("touchmove", this.touchDrag)
        document.addEventListener("touchend", this.stopTouchDrag)
      }
    },
    mouseStart(e) {
      if (this.start(e, e.clientY)) {
        document.addEventListener("mousemove", this.mouseDrag)
        document.addEventListener("mouseup", this.stopMouseDrag)
      }
    },
    drag(y) {
      this.currentOffset = this.startPos - y
      if (this.currentOffset > 200) {
        this.currentOffset = 200
      }
      if (this.currentOffset < 0) {
        this.currentOffset = 0
      }
      this.$refs.panel.style.top = -this.currentOffset + "px"
      this.$refs.send.style.bottom = this.currentOffset - 24 + "px"
    },
    touchDrag(e) {
      this.drag(e.touches[0].clientY)
    },
    mouseDrag(e) {
      this.drag(e.clientY)
    },
    stop() {
      this.dragging = false
      if (this.currentOffset < 100) {
        this.currentOffset = 0
        this.$refs.panel.style.top = "0px"
        this.$refs.send.style.bottom = "0px"
      } else {
        // send it!
        this.submit()
      }
    },
    stopTouchDrag() {
      this.stop()
      document.removeEventListener("touchmove", this.touchDrag)
      document.removeEventListener("touchend", this.stopTouchDrag)
    },
    stopMouseDrag() {
      this.stop()
      document.removeEventListener("mousemove", this.mouseDrag)
      document.removeEventListener("mouseup", this.stopMouseDrag)
    },
    submit() {
      if (this.panelType === 'd') {
        return
      }
      this.sending = true
      this.$refs.panel.style.top = "-400px";
      this.$refs.send.style.height = "384px";
      if (this.panelType === 'p') {
        this.$emit('send-solution')
      } else {
        this.$emit('submit')
      }
    },
    dismiss() {
      if (this.status === 'success') {
        this.$emit('dismiss')
      } else if (this.status === 'failure') {
        this.$emit('reset')
        this.sending = false
        this.currentOffset = 0
        this.$refs.panel.style.top = null
      }
    }
  }
}
</script>

<style scoped>
.submit-wrapper {
  transition: top 0.1s; 
  touch-action: none;
}
.send-icon {
  transition: bottom 0.1s;
}
.large-icon {
  font-size: 4rem;
}
</style>