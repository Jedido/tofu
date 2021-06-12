export default {
  props: {
    socket: Object,
  },
  data() {
    return {
      listeners: [],
    }
  },
  unmounted() {
    this.listeners.forEach((e) => {
      this.socket.off(e)
    })
    clearInterval(this.counter)
  },
  methods: {
    emit(type, data) {
      this.socket.emit("action", `${this.$store.state.scene}-${type}`, data)
    },
    on(event, fn) {
      const eventName = `${this.$store.state.scene}-${event}`
      this.listeners.push(eventName)
      this.socket.on(eventName, fn)
    },
  },
}
