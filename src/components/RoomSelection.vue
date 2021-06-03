<template>
  <div class="scene">
    <h2>Select a Game</h2>
    <GameChoice
      v-for="(game, index) in games"
      v-bind="{ ...$attrs, ...game }"
      :key="index"
    />
  </div>
</template>

<script>
import GameChoice from './GameChoice.vue'

export default {
  name: 'GameSelection',
  components: { GameChoice },
  data() {
    return {
      games: [
        { name: 'Anagram', scene: 'anagram' },
        { name: 'Minesweeper', scene: 'minesweeper' },
        { name: 'name3', scene: 'game3' }
      ],
      room: ''
    }
  }
}
</script>
