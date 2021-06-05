<template>
  <div :class="['container', { noselect: dragging }]" @mousemove="dragUpdate">
    <header>
      <label>
        Your username: <input type="text" id="ign" v-model="ign">
        <button @click="setIgn()">Set</button>
      </label>
      <p>User ID: {{ userId }}</p>
    </header>
    <main class="scene">
      <RoomSelection v-if="scene === 'select'" v-on:launch-game="launchGame" />
      <AnagramGame v-else-if="scene === 'anagram'" :socket="socket" />
      <MinesweeperGame v-else-if="scene === 'minesweeper'" :socket="socket" :game-width="gameWidth" />
      <div v-else>{{ scene }}</div>
    </main>
    <div class="dragbar" @mousedown="startDrag"></div>
    <div class="sidebar" :style="{
      width: `${sidebarWidth}px`
    }">
      <EventLog v-on:join-room="joinRoom" v-on:leave-room="leaveRoom" :socket="socket" :roomId="roomId" />
    </div>
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
      userId: 'loading...',
      dragging: false,
      dragX: 0,
      oldWidth: 300,
      sidebarWidth: 300,
      gameWidth: 0
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
    console.log(window.location.pathname)  // to use later?
  },
  mounted() {
    document.addEventListener('mouseup', () => {
      if (this.dragging) {
        this.resizeGame()
      }
      this.dragging = false
    })
    window.addEventListener('resize', this.resizeGame)
    this.gameWidth = document.querySelector('.scene').clientWidth
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
    },
    async resizeGame() {
      this.gameWidth = document.querySelector('.scene').clientWidth
      await this.$nextTick()
    },
    startDrag(e) {
      this.dragging = true
      this.oldWidth = this.sidebarWidth
      this.dragX = e.clientX
    },
    dragUpdate(e) {
      if (!this.dragging) {
        return false
      }
      let dx = e.clientX - this.dragX
      this.sidebarWidth = this.oldWidth - dx
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
  min-height: 100vh;
  grid-template-rows: 100px auto auto min-content;
  grid-template-areas: 
    "header"
    "scene"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: auto 4px min-content;
    grid-template-rows: 100px auto min-content;
    grid-template-areas: 
      "header header header"
      "scene dragbar sidebar"
      "footer footer footer";
  }
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

footer {
  grid-area: footer;
  background-color: #222;
}

.dragbar {
  background: #ddd;
}

.dragbar:hover {
  cursor: col-resize;
  border: 4px #2c3e50;
  border-style: none solid;
}

.sidebar {
  padding: 12px;
  grid-area: sidebar;
  background-color: white;
  width: 300px;
}

.scene {
  padding: 12px;
  grid-area: scene;
  background-color: white;
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
