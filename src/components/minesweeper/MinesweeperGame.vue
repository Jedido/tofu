<template>
  <div id="minesweeper" class="select-none text-gray-700 w-full">
    <h2 class="text-2xl text-center">Minesweeper</h2>
    <div class="flex justify-between text-sm">
      <p v-if="status === 'ongoing'">Time: {{ time }} seconds</p>
      <p v-else-if="status !== ''">You {{ status }}</p>
      <p v-if="status === 'ongoing'">Revealed: {{ revealed }}</p>
      <p v-else>Click "New Game" to start a game</p>
      <p>Flags: {{ flags }} / {{ mines }}</p>
    </div>
    <div
      id="minesweeper-board"
      :class="[
        status,
        'grid w-full box-border p-3 relative bg-gray-300 font-bold',
      ]"
      :style="{
        'grid-template-rows': `repeat(${size}, 1fr)`,
        'grid-template-columns': `repeat(${size}, 1fr)`,
        fontSize: cellSize,
        lineHeight: cellSize,
        height: `${$store.state.gameWidth}px`,
      }"
    >
      <MinesweeperCell
        v-for="(cell, index) in board"
        :key="index"
        class="space border border-gray-500 text-center"
        :value="cell"
        @reveal-space="revealSpace(index)"
        @flag-space="flagSpace(index)"
      />
    </div>
    <div class="grid grid-cols-6 my-2 gap-3">
      <p class="col-span-2 text-right">Board size</p>
      <input
        v-model="inputSize"
        class="rounded text-center shadow outline-none"
        type="number"
        min="5"
        max="50"
      />
      <button
        class="row-span-2 col-span-3 bg-gray-200 rounded shadow hover:bg-gray-100 active:bg-gray-300 focus:outline-none"
        @click="minesweeper"
      >
        New Game
      </button>
      <p class="col-span-2 text-right">Mines</p>
      <input
        v-model="mines"
        class="rounded text-center shadow outline-none"
        type="number"
        min="1"
        max="2499"
      />
    </div>
  </div>
</template>

<script>
import MinesweeperCell from "@/components/minesweeper/MinesweeperCell.vue"
import socket from "@/mixins/socket.js"

export default {
  name: "MinesweeperGame",
  components: {
    MinesweeperCell,
  },
  mixins: [socket],
  data() {
    return {
      board: [],
      status: "",
      inputSize: 25,
      size: 4,
      mines: 100,
      time: 0,
      flags: 0,
      revealed: 0,
      counter: null,
    }
  },
  computed: {
    cellSize() {
      return `${(this.$store.state.gameWidth - 48) / this.size - 2}px`
    },
  },
  created() {},
  mounted() {
    this.on("board", (data) => {
      this.setBoard(data)
      this.$nextTick(() => {
        this.revealed = this.board.filter((val) => val > 0).length
      })
    })
    this.on("update-space", ({ x, y, value }) => {
      this.board[x * this.size + y] = value
      this.$nextTick(() => {
        this.revealed = this.board.filter((val) => val > 0).length
        this.flags = this.board.filter((val) => val === -20).length
      })
    })
    this.emit("get-board")
  },
  unmounted() {
    clearInterval(this.counter)
  },
  methods: {
    /** Makes a game of minesweeper */
    minesweeper() {
      this.size = this.inputSize
      this.emit("init", {
        size: this.size,
        bombs: this.mines,
      })
    },
    setBoard(res) {
      this.board = res.board.reduce((acc, cur) => acc.concat(cur), [])
      this.status = res.status
      this.mines = res.mines
      this.size = res.size
      this.time = res.time
      if (this.status !== "ongoing") {
        clearInterval(this.counter)
      } else if (!this.counter) {
        this.counter = setInterval(this.tick, 1000)
      }
    },
    revealSpace(i) {
      if (this.status !== "ongoing") {
        return
      }
      this.emit("reveal", {
        y: i % this.size,
        x: Math.floor(i / this.size),
      })
    },
    flagSpace(i) {
      if (this.status !== "ongoing") {
        return
      }
      this.emit("flag", {
        y: i % this.size,
        x: Math.floor(i / this.size),
      })
    },
    tick() {
      ++this.time
    },
  },
}
</script>

<style scoped>
#minesweeper-board {
  font-family: "Courier New", monospace;
}

.win .space {
  border: 1px solid green;
  background-color: lightgreen;
}

.lose .space {
  border: 1px solid red;
  background-color: pink;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
