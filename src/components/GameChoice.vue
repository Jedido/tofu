<template>
  <div class="game-choice">
    <button @click="$emit('launchGame', scene)">{{ name }}</button>
  </div>
</template>

<script>
export default {
  name: "GameChoice",
  props: {
    name: String,
    scene: String,
  },
}
</script>

<style scoped>
.game-choice {
  background: #eee;
  margin-bottom: 8px;
}
button {
  padding: 20px;
  width: 100%;
}
</style>
