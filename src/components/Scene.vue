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

<style>
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: white;
}

.content {
  grid-template-rows: min-content auto auto min-content;
  grid-template-areas:
    "header"
    "scene"
    "sidebar"
    "footer";
}

.sidebar {
  grid-area: sidebar;
}

@media (min-width: 768px) {
  .content {
    grid-template-columns: auto 4px min-content;
    grid-template-rows: min-content auto min-content;
    grid-template-areas:
      "header header header"
      "scene dragbar sidebar"
      "footer footer footer";
  }
}

header {
  grid-area: header;
}

footer {
  grid-area: footer;
}

.dragbar:hover {
  cursor: col-resize;
}

.scene {
  grid-area: scene;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>
