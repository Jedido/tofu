<template>
  <div class="h-full w-full relative" @pointerdown="toggleSelection">
    <div
      v-if="tools.length > 1"
      v-for="(tool, i) in tools"
      :key="tool"
      class="palette absolute -translate-y-1/2 left-1/2 -translate-x-1/2"
    >
      <div class="h-6 origin-bottom" :style="`transform: rotate(${i * degrees}deg)`">
        <div
          class="w-4 h-4 rounded-full color"
          :class="{
            [tool]: true,
            'scale-125 border': i === current,
            'scale-50': i !== current
          }"
        ></div>
      </div>
    </div>
    <div v-else class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <div class="w-8 h-8 rounded-full" :class="tools[0]"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaintTools",
  props: {
    tools: Array,
    selected: Boolean
  },
  data() {
    return {
      current: 0
    }
  },
  methods: {
    toggleSelection() {
      if (this.selected) {
        this.current = (this.current + 1) % this.tools.length
      }
      this.$emit("update-control", { color: this.tools[this.current] })
    }
  },
  computed: {
    degrees() {
      return 360 / this.tools.length
    }
  }
}
</script>

<style scoped>
.palette {
  top: calc(50% - 12px);
}
.color {
  transition: transform 0.3s;
}
.red {
  background-color: #ff5144;
}
.blue {
  background-color: #419dff;
}
.yellow {
  background-color: #ffd152;
}
.green {
  background-color: #41ff7a;
}
.purple {
  background-color: #9335ff;
}
.orange {
  background-color: #ff8c44;
}
</style>