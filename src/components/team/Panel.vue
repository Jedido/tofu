<template>
  <div
    ref="card"
    class="relative text-gray-50 max-w-64 panel"
    :class="{
      'hover': hover && !active,
      'drag': dragging,
      'selectable': cardY < 120
    }"
    :style="`top:${cardY}px;`"
  >
    <div
      ref="panel" 
      class="submit-wrapper relative z-10 px-2 rounded flex flex-col justify-between w-64 h-96" 
      :class="{
        'bg-cyan-800': panelType === 'p',
        'bg-gray-500': panelType === 'd',
        'bg-gray-800': panelType === 'k1' || panelType === 'k2',
        'bg-emerald-700': panelType === 'w',
        'send': !dragging
      }"
      @pointerdown.stop="start"
      @contextmenu.stop="submit"
    >
      <div class="text-lg h-8 text-center py-1 relative capitalize">
        <slot name="title"></slot>
      </div>
      <div class="bg-white h-60 w-60 relative rounded-lg mx-auto text-gray-800 overflow-hidden">
        <slot name="content"></slot>
      </div>
      <div 
        class="rounded h-24 relative mx-1 my-2"
        :class="{
          'bg-cyan-700': panelType === 'p',
          'bg-gray-400': panelType === 'd',
          'bg-gray-700': panelType === 'k1' || panelType === 'k2',
          'bg-emerald-600': panelType === 'w'
        }"
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
      @pointerdown.stop="dismiss"
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

const DEFAULT_CARD_Y = 308
export default {
  name: "Panel",
  props: {
    active: Boolean,
    panelType: String,
    hover: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: 'pending'
    }
  },
  data() {
    return {
      dragging: false,
      currentOffsetY: 0,
      currentOffsetX: 0,
      startX: 0,
      startY: 0,
      cardY: DEFAULT_CARD_Y,
      startTime: 0,
      sending: false,
      canSelect: false
    }
  },
  methods: {
    getElement(e) {
      return e.touches ? e.touches[0] : e
    },
    start(e) {
      const element = this.getElement(e)
      if (this.sending || (this.active && this.panelType === 'd')) {
        return
      }
      e.preventDefault()
      this.dragging = true
      if (this.active) {
        this.startY = element.clientY
      } else {
        const originalY = (parseInt(this.$refs.card.style.top) || 0)
        this.startY = element.clientY - originalY
        this.startX = element.clientX
        this.cardY = originalY
      }
      document.addEventListener("pointermove", this.drag)
      document.addEventListener("pointerup", this.stop)
    },
    drag(e) {
      const element = this.getElement(e)
      this.currentOffsetX = this.startX - element.clientX
      this.currentOffsetY = this.startY - element.clientY
      if (!this.active) {
        this.$refs.card.style.left = -this.currentOffsetX + "px"
        this.cardY = -this.currentOffsetY
        this.$refs.card.style.scale = Math.min(Math.max(1.05 - this.cardY / 100 * 0.2, 0.5), 1)
      } else {
        if (this.currentOffsetY > 200) {
        this.currentOffsetY = 200
        }
        if (this.currentOffsetY < 0) {
          this.currentOffsetY = 0
        }
        this.$refs.send.style.bottom = this.currentOffsetY - 24 + "px"
        this.$refs.panel.style.top = -this.currentOffsetY + "px"
      }
    },
    stop() {
      this.dragging = false
      document.removeEventListener("pointermove", this.drag)
      document.removeEventListener("pointerup", this.stop)
      if (this.active) {
        if (this.currentOffsetY < 100) {
          this.currentOffsetY = 0
          this.$refs.panel.style.top = "0px"
          this.$refs.send.style.bottom = "0px"
        } else {
          // send it!
          this.submit()
        }
      } else {
        if (this.cardY < 120) {
          this.$refs.card.style.scale = null
          this.cardY = 30
          this.$emit('select')
        } else {
          this.$refs.card.style.scale = 0.5
          this.$refs.card.style.left = '0px'
        }
        this.cardY = DEFAULT_CARD_Y
      }
    },
    submit() {
      if (!this.active) {
        this.$refs.card.style.scale = null
        this.$emit('select')
        return
      }
      if (this.panelType === 'd') {
        return
      }
      this.sending = true
      this.$refs.panel.style.top = "-420px";
      this.$refs.send.style.height = "384px";
      this.$emit('submit')
    },
    dismiss() {
      if (this.status === 'success') {
        this.$emit('dismiss')
      } else if (this.status === 'failure') {
        this.$emit('reset')
        this.sending = false
        this.currentOffsetY = 0
        this.$refs.panel.style.top = null
      }
    }
  }
}
</script>

<style scoped>
.panel {
  scale: 0.5;
  transition: transform 0.1s ease, scale 0.3s;
  overflow-y: hidden;
  box-shadow: 0;
}
.hover {
  z-index: 30;
  transform: translateY(-10px);
}
.drag {
  transition: scale 0.1s, box-shadow 0.7s linear;
  z-index: 39;
  transform: none;
}
@keyframes glow {
  from {
    box-shadow: 0px 0px 1px 4px #f9d142;
  }
  to {
    box-shadow: 0px 0px 2px 3px #f9d142;
  }
}
.selectable {
  border-radius: 4px;
  animation: 1s glow alternate infinite;
}
.send {
  transition: top 0.5s ease-out; 
}
.submit-wrapper {
  touch-action: none;
}
.large-icon {
  font-size: 4rem;
}
</style>