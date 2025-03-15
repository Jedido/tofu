<template>
  <span
    class="text-white inline-block redacted-word"
    :class="{
      'bg-white': !unredact
    }"
    :style="{ width: `${wordLength}px` }"
  >
    {{ unredact ? word : "" }}
  </span>
</template>

<script>
export default {
  name: "RedactedWord",
  props: {
    word: String,
    unredact: Boolean,
  },
  data() {
    return {
      wordLength: 0
    }
  },
  mounted() {
    const canvas = document.getElementById("text-canvas").getContext("2d")
    const computedStyle = window.getComputedStyle(this.$el)
    canvas.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`
    this.wordLength = canvas.measureText(this.word).width
  }
}
</script>

<style>
.redacted-word {
  height: 1em;
  margin-right: 0.3em;
}
</style>
