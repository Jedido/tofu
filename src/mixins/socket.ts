import { defineComponent } from "vue"
import type { Socket } from "socket.io-client"

export default defineComponent({
  props: {
    socket: { type: Object as () => Socket, required: true },
  },
  data() {
    return {
      listeners: [] as string[],
    }
  },
  unmounted() {
    this.listeners.forEach((e: string) => {
      this.socket.off(e)
    })
  },
  methods: {
    emit(type: string, data?: unknown) {
      this.socket.emit("action", `${this.$store.state.scene}-${type}`, data)
    },
    on(event: string, fn: (...args: unknown[]) => void) {
      const eventName = `${this.$store.state.scene}-${event}`
      this.listeners.push(eventName)
      this.socket.on(eventName, fn)
    },
  },
})
