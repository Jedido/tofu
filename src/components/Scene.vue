<template>
  <main class="p-3 bg-amber-50 overflow-auto">
    <ExampleGame
      v-if="this.$store.state.scene === 'example'"
      :socket="socket"
    />
    <MinesweeperGame
      v-else-if="this.$store.state.scene === 'minesweeper'"
      :socket="socket"
      :game-width="$store.state.sceneWidth"
    />
    <AnagramGame
      v-else-if="this.$store.state.scene === 'anagram'"
      :socket="socket"
    />
    <GachaGame
      v-else-if="this.$store.state.scene === 'gacha'"
      :socket="socket"
    />
    <WatchGame
      v-else-if="this.$store.state.scene === 'watch'"
      :socket="socket"
    />
    <JeopardyGame
      v-else-if="this.$store.state.scene === 'jeopardy'"
      :socket="socket"
    />
    <SquaredleGame
      v-else-if="this.$store.state.scene === 'squaredle'"
      :socket="socket"
      :game-width="$store.state.sceneWidth"
    />
    <SandboxGame
      v-else-if="this.$store.state.scene === 'sandbox'"
      :socket="socket"
      :game-width="$store.state.sceneWidth"
    />
    <RoomSelection v-else v-on:launch-game="launchGame" />
  </main>
</template>

<script>
import { defineAsyncComponent } from "vue"
import RoomSelection from "./RoomSelection.vue"

export default {
  name: "Scene",
  props: {
    socket: Object,
  },
  components: {
    RoomSelection,
    ExampleGame: defineAsyncComponent(() =>
      import("./example/ExampleGame.vue")
    ),
    MinesweeperGame: defineAsyncComponent(() =>
      import("./minesweeper/MinesweeperGame.vue")
    ),
    AnagramGame: defineAsyncComponent(() =>
      import("./anagram/AnagramGame.vue")
    ),
    GachaGame: defineAsyncComponent(() => import("./gacha/GachaGame.vue")),
    WatchGame: defineAsyncComponent(() => import("./watch/WatchGame.vue")),
    JeopardyGame: defineAsyncComponent(() =>
      import("./jeopardy/JeopardyGame.vue")
    ),
    SquaredleGame: defineAsyncComponent(() => import("./squaredle/SquaredleGame.vue")),
    SandboxGame: defineAsyncComponent(() => import("./sandbox/SandboxGame.vue")),
  },
  data() {
    return {
      gameWidth: 0,
    }
  },
  mounted() {
    window.addEventListener("resize", this.resizeGame)
    this.socket.on("set-scene", (scene) => {
      this.$store.commit("setScene", scene)
    })
    this.resizeGame()
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.$store.commit("setScene", game)
      this.socket.emit("create-room", game, this.$store.state.ign)
    },
    resizeGame() {
      this.$store.commit(
        "setSceneWidth",
        document.querySelector(".scene").clientWidth
      )
    },
  },
}
</script>

<style scoped></style>
