<template>
  <div class="bg-gray-900 mx-2 pt-2 relative" :class="flip ? '-scale-x-100' : ''">
    <div class="absolute w-6 bg-gray-500 z-10 -top-1 -bottom-1"></div>
    <div class="h-full w-full bg-gray-800 relative">
      <template v-for="(wire, i) in wires">
        <div
          class="absolute z-10 bg-gray-900 w-4 h-4 flex items-center rounded-sm cursor-pointer"
          :style="[`top: ${i * 28 - 2}px;`]"
          @click.stop="cutWire(i)"
        >
          <div class="h-1 w-4" :style="[`background: ${getBackground(wire)}`]"></div>
          <div v-if="wire.cut" class="absolute left-px right-px h-4 bg-gray-900"></div>
        </div>
        <div
          class="absolute h-1 shadow-lg origin-left left-5 cursor-pointer"
          :style="getWireStyle(wire, i)"
          @click.stop="cutWire(i)"
        >
        </div>
      </template>
    </div>
    <div class="absolute w-2 bg-gray-500 z-10 -top-1 -bottom-1 -right-1"></div>
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
    getBackground(wire) {
      return wire.stripe ? `repeating-linear-gradient(45deg, ${wire.stripe}, ${wire.stripe} 8px, ${wire.color} 8px, ${wire.color} 16px)` : wire.color
    },
    getWireStyle(wire, i) {
      const styles = {}
      styles.backgroundColor = wire.color;
      styles.background = this.getBackground(wire)
      const y1 = i * 28
      const y2 = wire.y * 28

      // Calculate distance and angle between points
      const distance = Math.hypot(60, y2 - y1)
      const angle = Math.atan2(y2 - y1, 60) * (180 / Math.PI)
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