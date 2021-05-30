<template>
    <p class="sidebar">Please select a game.</p>
    <div class="scene">
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
      ] 
    }
  }
}
</script>
