<template>
  <div class="bg-gray-900 mx-2 pt-2 relative" :class="flip ? '-scale-x-100' : ''">
    <div class="absolute w-6 bg-gray-500 z-40 -top-2 -bottom-2"></div>
    <div class="h-full w-full bg-gray-800 relative">
      <template v-for="(wire, i) in wires">
        <div
          class="absolute z-50 bg-gray-900 w-4 h-4 flex items-center rounded-sm cursor-pointer"
          :style="[`top: ${i * 28 - 2}px;`]"
          @click.prevent="cutWire(i)"
        >
          <div class="h-1 w-4" :style="[`background-color: ${wire.color}`]"></div>
          <div v-if="wire.cut" class="absolute left-px right-px h-4 bg-gray-900"></div>
        </div>
        <div
          class="absolute h-1 shadow-lg origin-left left-4 cursor-pointer"
          :style="getWireStyle(wire, i)"
          @click.prevent="cutWire(i)"
        >
        </div>
      </template>
    </div>
    <div class="absolute w-2 bg-gray-500 z-50 -top-2 -bottom-2 -right-1"></div>
  </div>
</template>

<script>
export default {
  name: "BombPanel",
  props: {
    wires: Array,
    flip: Boolean
  },
  methods: {
    getWireStyle(wire, i) {
      const styles = {}
      styles.backgroundColor = wire.color;
      const y1 = i * 28
      const y2 = wire.y * 28

      // Calculate distance and angle between points
      const distance = Math.hypot(64, y2 - y1)
      const angle = Math.atan2(y2 - y1, 64) * (180 / Math.PI)
      styles.width = `${distance}px`;
      styles.top = `${y1 + 4}px`;
      styles.transform = `rotate(${angle}deg)`;
      return styles
    },
    cutWire(i) {
      if (this.wires[i].cut) {
        return
      }
      this.wires[i].cut = true
      this.$emit('cut', i)
    }
  }
}
</script>