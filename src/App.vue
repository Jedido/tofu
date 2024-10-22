<template>
  <div class="grid h-screen content">
    <Header id="header" :socket="socket" />
    <Scene id="scene" :socket="socket" />
    <DragBar id="dragbar" />
    <EventLog id="sidebar" :socket="socket" />
    <footer id="footer" class="p-3 bg-emerald-700 text-emerald-50">
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
      gameWidth: 0
    }
  },
  created() {
    this.socket = io(`ws://${window.location.host}`)
    this.socket.on("connect", () => {
      console.log("connected to the service")
      if (this.$store.state.room) {
        this.socket.emit("join-room", this.$store.state.room)
      }
      if (localStorage.getItem("ign")) {
        this.socket.emit("set-ign", localStorage.getItem("ign"))
      }
    })
  },
  mounted() {
    window.addEventListener("resize", this.resizeGame)
    this.resizeGame()
    this.socket.on("alert", (message) => {
      alert(message)
    })
  },
  methods: {
    launchGame(game) {
      this.scene = game
      this.$store.commit("setGame", game)
      this.socket.emit("create-room", game, this.$store.state.ign)
    },
    resizeGame() {
      this.gameWidth = document.querySelector(".content").clientWidth
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
  grid-template-rows: min-content auto min-content;
  grid-template-areas:
    "header"
    "scene"
    "sidebar";
}

#sidebar {
  grid-area: sidebar;
}

#footer {
  display: none;
}

#header {
  grid-area: header;
}

#dragbar {
  display: none;
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
  #dragbar {
    display: block;
  }
  #footer {
    display: block;
    grid-area: footer;
  }
}

#dragbar:hover {
  cursor: col-resize;
}

#scene {
  overflow: overlay;
  grid-area: scene;
  scrollbar-width: none;
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
