import type { Socket } from 'socket.io-client'

export default {
  props: {
    socket: Object as () => Socket,
  },
  data() {
    return {
      listeners: [] as string[],
    }
  },
  unmounted() {
    ;(this as any).listeners.forEach((e: string) => {
      ;(this as any).socket.off(e)
    })
  },
  methods: {
    emit(type: string, data?: any) {
      ;(this as any).socket.emit("action", `${(this as any).$store.state.scene}-${type}`, data)
    },
    on(event: string, fn: (...args: any[]) => void) {
      const eventName = `${(this as any).$store.state.scene}-${event}`
      ;(this as any).listeners.push(eventName)
      ;(this as any).socket.on(eventName, fn)
    },
  },
}
