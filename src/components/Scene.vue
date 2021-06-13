<template>
  <main class="p-3 bg-amber-50">
    <component
      :is="activeScene"
      :socket="socket"
      :game-width="$store.state.sceneWidth"
      v-on:launch-game="launchGame"
    />
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
  computed: {
    activeScene() {
      switch (this.$store.state.scene) {
        case "select":
          return RoomSelection
        case "example":
          return defineAsyncComponent(() => import("./example/ExampleGame.vue"))
        case "minesweeper":
          return defineAsyncComponent(() =>
            import("./minesweeper/MinesweeperGame.vue")
          )
        case "anagram":
          return defineAsyncComponent(() => import("./anagram/AnagramGame.vue"))
      }
      return null
    },
  },
}
</script>

<style scoped></style>
