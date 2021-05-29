<template>
  <div class="container">
    <header>
      <button @click="scene = 'select'">Back To Main Menu</button>
    </header>
    <main>
      <GameSelection v-if="scene === 'select'" v-on:launch-game="launchGame" />
      <AnagramGame v-else-if="scene === 'anagram'" />
      <MinesweeperGame v-else-if="scene === 'minesweeper'" />
      <div v-else>{{ scene }}</div>
    </main>
    <footer>
      You can download this app on github.com.
    </footer>
  </div>
</template>

<script>
import GameSelection from './components/GameSelection.vue'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'App',
  components: {
    GameSelection,
    AnagramGame: defineAsyncComponent(() => import('./components/anagram/AnagramGame.vue')),
    MinesweeperGame: defineAsyncComponent(() => import('./components/minesweeper/MinesweeperGame.vue'))
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
body, p {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: lightblue;
}

.container {
  display: grid;
  grid-template-columns: 10% auto 10%;
  grid-template-rows: 100px auto 100px;
  grid-template-areas: 
    ". header ."
    ". main ."
    ". footer .";
  height: 100vh;
}

header {
  grid-area: header;
  background-color: #222;
}

main {
  grid-area: main;
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 20px;
  grid-template-rows: auto;
  grid-template-areas:
    "scene sidebar";
}

footer {
  grid-area: footer;
  background-color: #222;
}

.sidebar {
  grid-area: sidebar;
  background-color: white;
}
.scene {
  grid-area: scene;
  background-color: white;
}
</style>
