<template>
  <div class="m-auto h-80 w-80 relative overflow-hidden border-4 border-emerald-400 rounded">
    <img class="relative max-h-full max-w-full" :style="imageStyle" :src="image" @contextmenu.prevent @dragstart.prevent />
  </div>
</template>

<script>
export default {
  name: "ZoomImage",
  props: {
    image: String,
    x: Number,
    y: Number,
    scale: {
      default: 0.01,
      type: Number,
    },
    time: {
      default: 20,
      type: Number
    },
    state: String
  },
  computed: {
    imageStyle() {
      const styles = {
        "image-rendering": "pixelated",
        transform: `scale(${1 / this.scale})`,
        top: 0,
        left: 0
      }
      if (this.state === 'start') {
        styles.transform = `${styles.transform} translate(-${this.x * 100}%, -${this.y * 100}%) translate(128px, 128px)`
        return styles
      }
      if (this.state === 'active') {
        styles.transition = `all ${this.time}s ease-out`
      }
      styles.transform = `translate(-50%, -50%)`
      styles.top = '50%'
      styles.left = '50%'
      return styles
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .h-80 {
    height: 16rem;
  }
  .w-80 {
    width: 16rem;
  }
}
</style>