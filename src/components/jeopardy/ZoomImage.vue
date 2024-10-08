<template>
  <div class="m-auto h-80 w-80 relative overflow-hidden border-4 border-emerald-400 rounded">
    <img class="relative" :style="imageStyle" :src="image" @contextmenu.prevent />
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
        transition: "none",
        transform: `scale(${1 / this.scale})`
      }
      if (this.state === 'active') {
        styles.transition = `all ${this.time}s ease-out`
        styles.transform = 'scale(1)'
      } else if (this.state === 'full') {
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      }
      styles.transform = `${styles.transform} translate(-${this.x * 100}%, -${this.y * 100}%) translate(128px, 128px)`
      return styles
    }
  }
}
</script>
