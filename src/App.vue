<template>
  <div class="container">
    <header>
      <p v-if="roomId">Room ID: {{ roomId }}</p>
      <button @click="scene = 'select'">Back To Main Menu</button>
    </header>
    <main>
      <RoomSelection v-if="scene === 'select'" v-on:launch-game="launchGame" v-on:join-room="joinRoom" />
      <AnagramGame v-else-if="scene === 'anagram'" :socket="socket" />
      <MinesweeperGame v-else-if="scene === 'minesweeper'" :socket="socket" />
      <div v-else>{{ scene }}</div>
    </main>
    <footer>
      You can download this app on github.com.
    </footer>
  </div>
</template>

<script>
import RoomSelection from './components/RoomSelection.vue'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'App',
  components: {
    RoomSelection,
    AnagramGame: defineAsyncComponent(() => import('./components/anagram/AnagramGame.vue')),
    MinesweeperGame: defineAsyncComponent(() => import('./components/minesweeper/MinesweeperGame.vue'))
  },
  data() {
    return {
      scene: 'select',
      socket: null,
      roomId: ''
    }
  },
  mounted() {
    const io = require('socket.io-client')
    this.socket = io(`ws://${window.location.host}`)
    console.log(window.location.pathname)  // to use later

    this.socket.on('connect', () => {
      console.log('connected to the service')
    })
    this.socket.on('set-scene', (scene) => {
      this.scene = scene
    })
    this.socket.on('set-room', (room) => {
      this.roomId = room
    })
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.socket.emit('create-room', game)
    },
    joinRoom(roomId) {
      this.socket.emit('join-room', roomId)
      this.room = roomId
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
  background-color: white;
}

.container {
  display: grid;
  grid-template-columns: 10% auto 10%;
  grid-template-rows: 100px auto 100px;
  grid-template-areas: 
    "header header header"
    ". main ."
    "footer footer footer";
  min-height: 100vh;
}

header {
  grid-area: header;
  background-color: #ccc;
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
