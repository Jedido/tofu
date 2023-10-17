<template>
  <div class="grid h-screen content">
    <Header class="header" :socket="socket" />
    <Scene class="scene" :socket="socket" />
    <DragBar class="dragbar" />
    <EventLog :socket="socket" />
    <footer class="p-3 bg-emerald-700 text-emerald-50 footer">
      You can download this app on github.com.
    </footer>
  </div>
</template>

<script>
import io from "socket.io-client"
import EventLog from "./components/EventLog.vue"
import Header from "./components/Header.vue"
import DragBar from "./components/DragBar.vue"
import Scene from "./components/Scene.vue"

export default {
  name: "App",
  components: {
    Header,
    EventLog,
    DragBar,
    Scene,
  },
  data() {
    return {
      scene: "select",
      socket: null,
      oldWidth: 300,
      sidebarWidth: 300,
      gameWidth: 0,
      md: window.innerWidth >= 768,
    }
  },
  created() {
    this.socket = io(`ws://${window.location.host}`)
    this.socket.on("connect", () => {
      console.log("connected to the service")
      this.$store.commit("leaveRoom")
    })
  },
  mounted() {
    document.addEventListener("mouseup", () => {
      if (this.dragging) {
        this.resizeGame()
      }
      this.dragging = false
    })
    window.addEventListener("resize", this.resizeGame)
    this.resizeGame()
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.$store.commit("setGame", game)
      this.socket.emit("create-room", game, this.$store.state.ign)
    },
    resizeGame() {
      this.gameWidth = document.querySelector(".content").clientWidth
      this.md = window.innerWidth >= 768
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
      const dx = e.clientX - this.dragX
      this.sidebarWidth = this.oldWidth - dx
      this.resizeGame()
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

.header {
  grid-area: header;
}

.footer {
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
