<template>
  <div class="container">
    <header>
      <label>
        Your username: <input type="text" id="ign" v-model="ign">
        <button @click="setIgn()">Set</button>
      </label>
      <p>User ID: {{ userId }}</p>
    </header>
    <main>
      <div class="scene">
        <RoomSelection v-if="scene === 'select'" v-on:launch-game="launchGame" />
        <AnagramGame v-else-if="scene === 'anagram'" :socket="socket" />
        <MinesweeperGame v-else-if="scene === 'minesweeper'" :socket="socket" />
        <div v-else>{{ scene }}</div>
      </div>
      <div v-if="socket" class="sidebar">
        <EventLog v-on:join-room="joinRoom" v-on:leave-room="leaveRoom" :socket="socket" :roomId="roomId" />
      </div>
    </main>
    <footer>
      You can download this app on github.com.
    </footer>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import io from 'socket.io-client'
import RoomSelection from './components/RoomSelection.vue'
import EventLog from './components/EventLog.vue'

export default {
  name: 'App',
  components: {
    RoomSelection,
    EventLog,
    AnagramGame: defineAsyncComponent(() => import('./components/anagram/AnagramGame.vue')),
    MinesweeperGame: defineAsyncComponent(() => import('./components/minesweeper/MinesweeperGame.vue'))
  },
  data() {
    return {
      scene: 'select',
      socket: null,
      roomId: '',
      ign: '',
      userId: 'loading...'
    }
  },
  created() {
    this.socket = io(`ws://${window.location.host}`)
    this.socket.on('connect', () => {
      console.log('connected to the service')
    })
    this.socket.on('set-scene', (scene) => {
      this.scene = scene
    })
    this.socket.on('set-room', (room) => {
      this.roomId = room
    })
    this.socket.on('set-user', (ign, id) => {
      this.ign = ign
      this.userId = id
    })
    console.log(window.location.pathname)  // to use later
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.socket.emit('create-room', game, this.ign)
    },
    joinRoom(roomId) {
      this.socket.emit('join-room', roomId, this.ign)
      this.roomId = roomId
    },
    leaveRoom() {
      this.socket.emit('leave-room')
      this.roomId = null
      this.scene = 'select'
    },
    setIgn() {
      if (this.ign.search(/user/) === -1) {
        this.socket.emit('set-ign', this.ign)
      } else {
        alert('Username cannot contain the string "user" in it!')
      }
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
  row-gap: 20px;
  grid-template-areas: 
    "header header header"
    ". main ."
    "footer footer footer";
  min-height: 100vh;
}

header {
  grid-area: header;
  background-color: #ccc;
  padding: 12px;
}

#ign {
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid black;
  margin-bottom: 8px;
}

input:focus {
  outline: none;
}

main {
  grid-area: main;
  display: grid;
  row-gap: 20px;
  grid-template-areas:
    "scene"
    "sidebar";
}
@media (min-width: 768px) {
  main {
    grid-template-areas:
      "scene sidebar";
    grid-template-columns: auto 300px;
    column-gap: 20px;
  }
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
