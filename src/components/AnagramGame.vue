<template>
  <article class="anagram">
      <p>Welcome to the game of Anagram</p>
  </article>
</template>

<script>
export default {
  name: 'GameSelection',
  mounted() {
      console.log('anagram game is loading up')
  }
}
</script>

<style scoped>
.anagram {
    background: #aaa000;
    padding: 20px;
}
</style>
