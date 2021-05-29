<template>
  <div class="game-choice">
      <button @click="$emit('launchGame', scene)">{{ name }}</button>
  </div>
</template>

<script>
export default {
  name: 'GameChoice',
  props: {
    name: String,
    scene: String
  }
}
</script>

<style scoped>
.game-choice {
    background: #aaa;
    padding: 20px;
}
</style>
