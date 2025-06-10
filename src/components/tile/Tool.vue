<template>
  <div class="tool w-16 h-16 rounded border-2 bg-gray-800" :class="{ 'border-gray-900': !selected, 'border-amber-200': selected }">
    <slot />
  </div>
</template>

<script>
export default {
  name: "Tool",
  props: {
    selected: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.tool {
  transition: border-color 0.2s;
}
</style>