<template>
  <div class="sidebar">
    <p v-for="(index, logLine) in logs" :key="index">{{ logLine }}</p>
  </div>
</template>

<script>
export default {
  name: 'EventLog',
  props: {
    socket: Object
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
  }
}
</script>

<style scoped>
.game-choice {
    background: #aaa;
    padding: 20px;
}
</style>
