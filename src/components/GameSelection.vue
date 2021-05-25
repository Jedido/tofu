<template>
  <div class="hello">
      <p>Please select a game.</p>
      <game-choice v-for="(game, index) in games" v-on:launch-game="launchGame" v-bind="game" :key="index" />
  </div>
</template>

<script>
import GameChoice from './GameChoice.vue'

export default {
  components: { GameChoice },
  name: 'GameSelection',
  data() {
    return {
        games: [
            { name: 'Anagram', src: 'anagram' },
            { name: 'name2', src: 'game2' },
            { name: 'name3', src: 'game3' }
        ] 
    }
  },
  methods: {
    launchGame(game) {
      this.$emit('launchGame', game)
    }
  }
}
</script>
