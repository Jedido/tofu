<template>
  <div>
    <button @click="scene = 'select'">Back To Main Menu</button>
    <GameSelection v-if="scene === 'select'" v-on:launch-game="launchGame" />
    <AnagramGame v-else-if="scene === 'anagram'" />
    <div v-else>{{ scene }}</div>
  </div>
</template>

<script>
import GameSelection from './components/GameSelection.vue'
import AnagramGame from './components/AnagramGame.vue'

export default {
  name: 'App',
  components: {
    GameSelection,
    AnagramGame
  },
  data() {
    return {
      scene: 'select'
    }
  },
  methods: {
    launchGame(game) {
      this.scene = game
    }
  }
}
</script>

<style>
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
