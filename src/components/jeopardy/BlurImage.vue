<template>
  <div class="h-full border-4 border-emerald-400 rounded overflow-hidden">
    <img class="max-h-full" :style="imageStyle" :src="image" @contextmenu.prevent @dragstart.prevent />
  </div>
</template>

<script>
export default {
  name: "BlurImage",
  props: {
    image: String,
    blur: {
      default: 40,
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
        transform: "scale(1.1)"
      }
      if (this.state === "active") {
        styles.transition = `all ${this.time}s ease-out`
      } else if (this.state === "start") {
        styles.filter = `blur(${this.blur}px)`
      } else if (this.state === "full") {
        styles.transition = "none"
      }
      return styles
    }
  }
}
</script>
