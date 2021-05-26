<template>
  <div id="app" class="container">
    <header>
      <button @click="scene = 'select'">Back To Main Menu</button>
    </header>
    <main>
      <GameSelection v-if="scene === 'select'" v-on:launch-game="launchGame" />
      <AnagramGame v-else-if="scene === 'anagram'" />
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
    AnagramGame: defineAsyncComponent(() => import('./components/anagram/AnagramGame.vue'))
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
  height: 100vh;
}

.container {
  display: grid;
  grid-template-columns: 10% auto 10%;
  grid-template-rows: 100px auto 100px;
  grid-template-areas: 
    ". header ."
    ". main ."
    ". footer .";
}

header {
  grid-area: header;
  background-color: salmon;
}

main {
  grid-area: main;
  display: grid;
  grid-template-columns: auto 200px;
  column-gap: 20px;
  grid-template-rows: auto;
  grid-template-areas:
    "scene sidebar";
}

footer {
  grid-area: footer;
  background-color: palevioletred;
}

.sidebar {
  grid-area: sidebar;
  background-color: white;
}
.scene {
  grid-area: scene;
  background-color: palegreen;
}
</style>
