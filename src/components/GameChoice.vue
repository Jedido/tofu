<template>
  <div class="game-choice">
      <button @click="launch()">{{ name }}</button>
  </div>
</template>

<script>
export default {
  name: 'GameSelection',
  props: {
      name: String,
      src: String
  },
  methods: {
      launch() {
          this.$emit('launchGame', this.src)
      }
  }
}
</script>

<style scoped>
.game-choice {
    background: #aaa;
    padding: 20px;
}
</style>
