<template>
  <div class="bg-white p-4">
    <h2 class="text-xl mb-2">Select a Game</h2>
    <div class="grid grid-cols-3 gap-3 w-full">
      <GameChoice
        v-for="(game, index) in games"
        v-bind="{ ...$attrs, ...game }"
        :key="index"
      />
    </div>
  </div>
</template>

<script>
import GameChoice from "./GameChoice.vue"

export default {
  name: "GameSelection",
  components: { GameChoice },
  data() {
    return {
      games: [
        { name: "Anagram", scene: "anagram" },
        { name: "Minesweeper", scene: "minesweeper" },
        { name: "Example Game", scene: "example" },
        { name: "Gacha Game", scene: "gacha" },
        { name: "Watch Together", scene: "watch" },
        { name: "Jeopardy!", scene: "jeopardy" },
        { name: "Squaredle", scene: "squaredle" },
        { name: "Sandbox", scene: "sandbox" },
        { name: "Team", scene: "team" },
      ],
      room: "",
    }
  },
}
</script>
