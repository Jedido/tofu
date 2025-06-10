<template>
  <div
    class="absolute unit z-40"
    :class="{ 'drop': drop }"
    :style="{ left: `${leftOffset}px`, top: `${topOffset}px` }" 
  >
    <div class="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 h-8 w-8 z-50" @pointerdown="start" @contextmenu.prevent=""></div>
    <div class="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2">
      <Block
        :top="top"
        :left="left" 
        :right="right" 
        :bottom="bottom" 
        :color="color" 
        :draggable="!drop"
      />
    </div>
    <div class="w-min arrow select-none absolute flex -top-3 right-0" :class="`arrow-${dragDirection}`">
      <i class="bi-arrow-left-circle-fill text-white" />
      <div class="w-6 h-6"></div>
    </div>
  </div>
</template>

<script>
import Block from "./Block.vue";

const Direction = {
  NONE: -1,
  RIGHT: 0,
  LEFT: 3,
  UP_RIGHT: 1,
  UP_LEFT: 2,
  DOWN_RIGHT: 5,
  DOWN_LEFT: 4,
}

// taken from HexGrid
const HEXAGON_WIDTH = 48;

export default {
  name: "PlayerUnit",
  components: {
    Block
  },
  props: {
    id: String,
    position: Number,
    top: Number,
    left: Number,
    right: Number,
    bottom: Number,
    color: String,
    movable: Boolean,
    drop: Boolean
  },
  data() {
    return {
      dragging: false,
      startX: 0,
      startY: 0,
      dragDirection: -1
    }
  },
  methods: {
    getElement(e) {
      return e.touches ? e.touches[0] : e
    },
    start(e) {
      if (!this.movable || this.drop) {
        return
      }
      const element = this.getElement(e)
      e.preventDefault()
      this.dragging = true
      this.startY = element.clientY
      this.startX = element.clientX
      document.addEventListener("pointermove", this.drag)
      document.addEventListener("pointerup", this.stop)
    },
    drag(e) {
      const element = this.getElement(e)
      const offsetX = this.startX - element.clientX
      const offsetY = this.startY - element.clientY
      const sqrMagnitude = offsetX * offsetX + offsetY * offsetY
      if (sqrMagnitude < 400) {
        this.dragDirection = -1
      } else {
        const direction = Math.atan(offsetY / offsetX)
        const degrees = direction / Math.PI * 180 + 90
        if (offsetX < 0) {
          if (degrees < 60) {
            this.dragDirection = Direction.UP_RIGHT
          } else if (degrees < 120) {
            this.dragDirection = Direction.RIGHT
          } else if (degrees < 180) {
            this.dragDirection = Direction.DOWN_RIGHT
          }
        } else {
          if (degrees < 60) {
            this.dragDirection = Direction.DOWN_LEFT
          } else if (degrees < 120) {
            this.dragDirection = Direction.LEFT
          } else if (degrees < 180) {
            this.dragDirection = Direction.UP_LEFT
          }
        }
      }
    },
    stop() {
      this.dragging = false
      document.removeEventListener("pointermove", this.drag)
      document.removeEventListener("pointerup", this.stop)
      if (this.dragDirection !== -1) {
        this.$emit("move", { direction: this.dragDirection, unit: this.id })
      }
      this.dragDirection = -1;
    },
  },
  computed: {
    leftOffset() {
      const y = Math.floor(this.position / 7);
      const x = this.position % 7;
      let offset = HEXAGON_WIDTH + 2.5;
      if (y % 2 === 1) {
        offset = HEXAGON_WIDTH / 2 + 1.25;
      }
      return x * (HEXAGON_WIDTH + 2) + offset;
    },
    topOffset() {
      const dropOffset = this.drop ? 600 : 0;
      const y = Math.floor(this.position / 7);
      const sqrt3 = Math.sqrt(3)
      const offset = HEXAGON_WIDTH / sqrt3
      return (offset * 3 / 2 + 2) * y + offset + 1 + dropOffset;
    }
  }
}
</script>
  
<style scoped>
.arrow {
  transform-origin: center right;
}
.arrow--1 {
  display: none;
}
.arrow-0 {
  transform: rotate(180deg);
}
.arrow-3 {
  transform: rotate(0deg);
}
.arrow-1 {
  transform: rotate(120deg);
}
.arrow-2 {
  transform: rotate(60deg);
}
.arrow-5 {
  transform: rotate(240deg);
}
.arrow-4 {
  transform: rotate(300deg);
}
.unit {
  transition: top 0.3s ease-out, left 0.3s ease-out;
}
.drop {
  transition: top 4s linear, opacity 4s ease-in, scale 4s ease-in !important;
  opacity: 0;
  scale: 0.8;
  z-index: 0 !important;
}
</style>
