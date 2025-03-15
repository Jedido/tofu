<template>
  <div id="content" class="h-screen overflow-y-hidden relative">
    <div id="scroll" class="overflow-y-auto h-full">
      <Header id="header" :socket="socket" />
      <Scene id="scene" :socket="socket" />
    </div>
  </div>
</template>

<script>
import io from "socket.io-client"
import Header from "@/components/Header.vue"
import Scene from "./components/Scene.vue"
import 'bootstrap-icons/font/bootstrap-icons.css'

globalThis.__VUE_PROD_DEVTOOLS__ = false
globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

export default {
  name: "App",
  components: {
    Header,
    Scene,
  },
  data() {
    return {
      scene: "select",
      socket: null,
    }
  },
  created() {
    this.socket = io(`ws://${window.location.host}`)
    this.socket.on("connect", () => {
      // Session Save
      if (localStorage.getItem("user")) {
        this.socket.emit("restore-user", JSON.parse(localStorage.getItem("user")))
      } else {
        this.socket.emit("create-user")
      }
      if (this.$store.state.room) {
        this.socket.emit("join-room", this.$store.state.room)
        return
      } else if (window.location.pathname.length === 6) {
        this.socket.emit("join-room", window.location.pathname.substring(1))
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
      this.$store.commit("setGameWidth", document.getElementById("content").clientWidth)
      this.$store.commit("setScreenWidth", document.getElementById("content").clientWidth)
    }
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

#scroll {
  overflow: overlay;
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
