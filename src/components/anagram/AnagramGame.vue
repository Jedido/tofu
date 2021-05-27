<template>
  <article class="anagram">
      <p>Welcome to the game of Anagram</p>
  </article>
</template>

<script>
export default {
  name: 'AnagramGame',
  async mounted() {
    console.log('anagram game is loading up')
    console.log(await this.axios.$get('/anagram/game'))
  },
  unmounted() {
    console.log('shutting down...')
  }
}
</script>

<style scoped>
.anagram {
    background: #aaa000;
    padding: 20px;
}
</style>
