<template>
  <div
    class="sidebar bg-amber-50 w-100 overflow-auto"
    :style="{
      width: `${md ? `${$store.state.sidebarWidth}px` : '100%'}`,
    }"
  >
    <div id="logs-container">
      <div id="logs-content" v-if="!$store.state.room">
        <form>
          <label>
            <p class="text-lg">Join with a Room Code</p>
            <input
              v-model="room"
              type="text"
              maxlength="5"
              spellcheck="false"
              class="outline-none"
            />
          </label>
          <button class="border-2 border-emerald-500 rounded hover:border-emerald-400 mt-3 mx-auto" @click.prevent="joinRoom()">Join</button>
        </form>
      </div>
      <div id="logs-content" content="flex flex-col" v-else>
        <p>
          Room: {{ $store.state.room }}
          <button class="border-2 border-amber-500 rounded hover:border-amber-400 mt-3 mx-auto" @click="leaveRoom()">Leave Room</button>
        </p>
        <h3>Event Log</h3>
        <p v-for="(logLine, index) in logs" :key="index">{{ logLine }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EventLog",
  props: {
    socket: Object,
  },
  data() {
    return {
      logs: [],
      md: window.innerWidth >= 768,
      room: "",
    }
  },
  mounted() {
    this.socket.on("all-logs", (logs) => {
      this.logs = logs
    })
    this.socket.on("log", (msg) => {
      this.logs.unshift(msg)
      this.logs = this.logs.slice(0, 50)
    })
    // this.socket.emit("get-logs")
    this.socket.on("set-room", (room) => {
      this.logs = []
      this.$store.commit("setRoom", room)
    })
    window.addEventListener("resize", this.resize)
    this.resize()
  },
  unmounted() {
    this.socket.off("all-logs")
    this.socket.off("log")
    this.logs = []
  },
  methods: {
    resize() {
      this.md = window.innerWidth >= 768
    },
    leaveRoom() {
      this.socket.emit("leave-room")
      this.$store.commit("leaveRoom")
    },
    joinRoom() {
      this.logs = []
      this.socket.emit("join-room", this.room)
      this.$store.commit("setRoom", this.room)
    },
  },
}
</script>

<style scoped>
#logs-container {
  display: block;
  box-sizing: border-box;
  height: 100%;
}
#logs-content {
  background: white;
  box-sizing: border-box;
  padding: 12px;
  height: 100%;
  width: 100%;
  font-size: 14px;
  line-height: 16px;
}
#logs-content p {
  margin-bottom: 4px;
}
h3 {
  text-align: center;
  margin-top: 8px;
  margin-bottom: 8px;
}
form {
  text-align: center;
}
input {
  border: none;
  width: 7.5ch;
  padding: 0px;
  margin-left: 0.5ch;
  background: repeating-linear-gradient(
      90deg,
      dimgrey 0,
      dimgrey 1ch,
      transparent 0,
      transparent 1.5ch
    )
    0 100%/100% 2px no-repeat;
  color: #2c3e50;
  font: 5ch consolas, monospace;
  letter-spacing: 0.5ch;
}
button {
  display: block;
  padding: 8px 20px;
}
</style>
