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
import Block from "./Block.vue"

export default {
  name: "TileOrder",
  components: {
    Block
  },
  props: {
    time: Number,
    top: Number,
    left: Number,
    right: Number,
    bottom: Number,
    color: String
  },
  data() {
    return {
      progress: 0
    }
  },
  mounted() {
    const interval = setInterval(() => {
      this.progress++;
      if (this.progress >= this.time) {
        clearInterval(interval);
      }
    }, 1000);
  },
  computed: {
    angle() {
      return this.progress * 360 / this.time;
    }
  }
}
</script>
  
<style scoped>
.order {
  grid-template-columns: auto 16px;;
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