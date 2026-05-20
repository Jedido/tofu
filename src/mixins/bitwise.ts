export default {
  methods: {
    getAsBoolean(index: number, uintarray: number[]): boolean {
      const arr = new Uint32Array(uintarray)
      const chunkIndex = Math.floor(index / 32)
      const bitIndex = index % 32
      return (arr[chunkIndex] & (1 << bitIndex)) !== 0
    }
  }
}
