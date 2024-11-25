export class BitArray {
  size: number
  data: Uint32Array

  constructor(size: number) {
    this.size = size;
    this.data = new Uint32Array(Math.ceil(size / 32))
  }

  get(index: number) {
    if (index < 0 || index >= this.size) throw new RangeError("Index out of bounds");
    const chunkIndex = Math.floor(index / 32);
    const bitIndex = index % 32;
    return (this.data[chunkIndex] & (1 << bitIndex)) !== 0;
  }

  set(index: number, value: boolean) {
    if (index < 0 || index >= this.size) throw new RangeError("Index out of bounds");
    const chunkIndex = Math.floor(index / 32);
    const bitIndex = index % 32;
    if (value) {
      this.data[chunkIndex] |= (1 << bitIndex)
    } else {
      this.data[chunkIndex] &= ~(1 << bitIndex)
    }
  }
}