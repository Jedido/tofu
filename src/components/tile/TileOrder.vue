<template>
  <div class="grid order items-center min-h-8">
    <Block
      class="mx-auto"
      :top="top"
      :left="left"
      :right="right"
      :bottom="bottom"
      :color="color"
    />
    <div class="timer h-4 w-4" :style="`--progress: ${angle};`"></div>
  </div>
</template>

<script>
import Block from "@/components/tile/TileBlock.vue"

export default {
  name: "TileOrder",
  components: {
    Block,
  },
  props: {
    time: { type: Number, required: true },
    top: { type: Number, required: true },
    left: { type: Number, required: true },
    right: { type: Number, required: true },
    bottom: { type: Number, required: true },
    color: { type: String, required: true },
  },
  data() {
    return {
      progress: 0,
    }
  },
  computed: {
    angle() {
      return (this.progress * 360) / this.time
    },
  },
  mounted() {
    const interval = setInterval(() => {
      this.progress++
      if (this.progress >= this.time) {
        clearInterval(interval)
      }
    }, 1000)
  },
}
</script>

<style scoped>
.order {
  grid-template-columns: auto 16px;
}
.timer {
  border-radius: 50%;
  background: conic-gradient(
    #ddd 0deg,
    #ddd calc(var(--progress) * 1deg),
    #82d9ff calc(var(--progress) * 1deg)
  );
}
</style>
