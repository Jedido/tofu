<template>
  <Modal>
    <div id="logs-container" class="w-64">
      <p class="text-sm py-1">
        Room ID: {{ $store.state.room || "None" }}
      </p>
      <div id="logs-content" class="flex flex-col border-2 relative">
        <div class="overflow-auto h-64 flex flex-col-reverse justify-start p-2">
          <p v-for="(logLine, index) in logs" :key="index">{{ logLine }}</p>
        </div>
        <form class="flex w-full border-gray-200 border-t-2" @submit.prevent="sendMessage()">
          <input
            v-model="message"
            maxlength="200"
            type="text"
            id="input"
            class="outline-none bg-gray-50 px-2 py-2 col-span-5 grow"
            autocomplete="off"
            placeholder="Send a message..."
          />
          <i
            class="cursor-pointer bi-send text-2xl pr-1 text-gray-400"
            @pointerdown="this.sendMessage()"
          />
        </form>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
  name: "EventLog",
  components: {
    Modal
  },
  props: {
    socket: Object,
  },
  data() {
    return {
      logs: [],
      md: window.innerWidth >= 768,
      hideLogs: false,
      message: ""
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
    this.socket.on("log-message", ({ ign, msg }) => {
      this.logs.unshift(`${ign}: ${msg}`)
      this.logs = this.logs.slice(0, 50)
    })
  },
  methods: {
    sendMessage() {
      if (this.message) {
        this.socket.emit("send-message", this.message)
        this.message = ""
      }
    }
  },
}
</script>

<style scoped>
#logs-container {
  display: block;
  box-sizing: border-box;
  height: 100%;
  background: white;
}
#logs-content {
  box-sizing: border-box;
  padding-top: 12px;
  height: 100%;
  width: 100%;
  font-size: 14px;
  line-height: 16px;
}
#logs-content p {
  margin-bottom: 4px;
}
form {
  text-align: center;
}
</style>
