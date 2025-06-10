<template>
  <div class="h-full w-full text-white flex items-center justify-between relative" @pointerdown="toggleSelection">
    <div class="absolute tool w-full h-full top-1/2 -translate-y-1/2" :class="{
      'opacity-40 w-4 scale-125': !toggle,
      'grow scale-150': toggle
    }">
      <div class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-md">
        <div
          v-for="direction in directions"
          :key="direction"
          class="absolute origin-left arrow"
          :style="`transform: rotate(${direction * -60}deg)`"
        >
          <i class="bi-arrow-right"></i>
        </div>
      </div>
    </div>
    <div
      class="absolute tool w-full text-4xl"
      :class="{
        'opacity-40 w-4': toggle,
        'grow scale-125': !toggle
      }"
    >
      <div class="absolute h-9 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <i v-if="rotation === '6'" class="bi-arrow-clockwise"></i>
        <i v-else class="bi-arrow-counterclockwise"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MovementTools",
  props: {
    tools: Array,
    selected: Boolean
  },
  data() {
    return {
      toggle: true
    }
  },
  methods: {
    toggleSelection() {
      if (this.selected) {
        this.toggle = !this.toggle
      }
      if (this.toggle) {
        this.$emit("update-control", null)
      } else {
        this.$emit("update-control", { direction: parseInt(this.rotation) })
      }
    }
  },
  computed: {
    directions() {
      return this.tools.filter(tool => tool < 6)
    },
    rotation() {
      return this.tools.find(tool => tool >= 6)
    }
  }
}
</script>

<style scoped>
.tool {
  transition: transform 0.3s, opacity 0.3s;
}
.arrow {
  line-height: 16px;
  top: -8px;
}
</style>