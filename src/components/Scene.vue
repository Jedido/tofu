<template>
  <main class="bg-amber-50 py-3" :class="{ 'px-3': this.md }">
    <div id="main-content" class="mx-auto">
      <ExampleGame
        v-if="this.$store.state.scene === 'example'"
        :socket="socket"
      />
      <MinesweeperGame
        v-else-if="this.$store.state.scene === 'minesweeper'"
        :socket="socket"
        :game-width="$store.state.gameWidth"
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
        :game-width="$store.state.gameWidth"
      />
      <SandboxGame
        v-else-if="this.$store.state.scene === 'sandbox'"
      />
      <TeamGame
        v-else-if="this.$store.state.scene === 'team'"
        :socket="socket"
      />
      <RoomSelection
        v-else
        :socket="socket"
        @launch-game="launchGame" 
      />
    </div>
  </main>
</template>

<script>
import { defineAsyncComponent } from "vue"
import RoomSelection from "./RoomSelection.vue"
import breakpoints from "@/mixins/breakpoints";

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
    TeamGame: defineAsyncComponent(() => import("./team/TeamGame.vue")),
  },
  mixins: [breakpoints],
  data() {
    return {
      gameWidth: 0,
    }
  },
  mounted() {
    this.socket.on("set-scene", (scene) => {
      this.$store.commit("setScene", scene)
    })
    this.$store.commit("setSidebarWidth", 300)
    this.$store.commit("setGameWidth", document.querySelector("#scene").clientWidth)
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.$store.commit("setScene", game)
      this.socket.emit("create-room", game, this.$store.state.ign)
    },
  },
}
</script>

<style scoped>
#main-content {
  max-width: 48rem;
}
</style>
