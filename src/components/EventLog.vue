<template>
  <div id="logs-container">
    <div id="logs-content" v-if="!roomId">
      <h3>Join a Room</h3>
      <form>
        <label>
          <p>Room Code</p>
          <input v-model="room" type="text" maxlength="5" spellcheck="false">
        </label>
        <button @click="$emit('join-room', room)">Join</button>
      </form>
    </div>
    <div id="logs-content" v-else>
      <p>Room: {{ roomId }} <button @click="$emit('leave-room')">Leave Room</button></p>
      <h3>Event Log</h3>
      <p v-for="(logLine, index) in logs" :key="index">{{ logLine }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventLog',
  props: {
    socket: Object,
    roomId: String
  },
  data() {
    return { logs: [] }
  },
  mounted() {
    this.socket.on('all-logs', (logs) => {
      this.logs = logs
    })
    this.socket.on('log', (msg) => {
      this.logs.push(msg)
    })
    this.socket.emit('get-logs')
  },
  unmounted() {
    this.socket.off('all-logs')
    this.socket.off('log')
    this.logs = []
  }
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
  padding: 8px;
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
  background: 
    repeating-linear-gradient(90deg, 
        dimgrey 0, 
        dimgrey 1ch, 
        transparent 0, 
        transparent 1.5ch) 
      0 100%/100% 2px no-repeat;
  color: #2c3e50;
  font: 5ch consolas, monospace;
  letter-spacing: .5ch;
}
button {
  display: block;
  margin: 12px auto 0px auto;
  padding: 8px 20px;
}
</style>
