<template>
  <div class="h-full w-full text-white grid grid-cols-2 relative" @pointerdown="setControl">
    <div v-if="sortedTools.length === 1">
      <Block class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 scale-125" :top="0" :left="0" :right="0" :bottom="parseInt(sortedTools[0])" color="fade" />
    </div>
    <div
      v-else
      v-for="tool in sortedTools"
      :key="tool"
      class="relative"
    >
      <Block class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 scale-90" :top="0" :left="0" :right="0" :bottom="parseInt(tool)" color="fade" />
    </div>
  </div>
</template>

<script>
import Block from "./Block.vue"
export default {
  name: "AppendTools",
  components: {
    Block,
  },
  props: {
    tools: Array
  },
  methods: {
    setControl() {
      this.$emit("update-control", {})
    }
  },
  computed: {
    sortedTools() {
      return this.tools.toSorted()
    }
  }
}
</script>
