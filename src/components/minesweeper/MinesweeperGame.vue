<template>
  <div id="minesweeper">
    <h2>Minesweeper</h2>
    <div id="minesweeper-info">
      <p v-if="status === 'ongoing'">Time: {{ time }} seconds</p>
      <p v-else-if="status !== ''">You {{ status }}</p>
      <p v-if="status === 'ongoing'">Revealed: {{ revealed }}</p>
      <p v-else>Click "New Game" to start a game</p>
      <p>Flags: {{ flags }} / {{ mines }}</p>
    </div>
    <div id="minesweeper-board" :class="status" :style="{
      'grid-template-rows': `repeat(${size}, 1fr)`,
      'grid-template-columns': `repeat(${size}, 1fr)`,
      'fontSize': cellSize,
      'lineHeight': cellSize,
      'height': `${gameWidth - 24}px`
    }">
      <MinesweeperCell
        v-for="(cell, index) in board"
        v-on:reveal-space="() => revealSpace(index)"
        v-on:flag-space="() => flagSpace(index)"
        class="space"
        :key="index"
        :value="cell"
      />
    </div>
    <div id="options">
      <p>Board size (default 25): <input v-model="inputSize" type="number" min="5" max="50"></p>
      <p>Mines (default 100): <input v-model="mines" type="number" min="1" max="2499"></p>
      <button @click="minesweeper">New Game</button>
    </div>
  </div>
</template>

<script>
import MinesweeperCell from './MinesweeperCell.vue'

export default {
  name: 'MinesweeperGame',
  components: {
    MinesweeperCell
  },
  props: {
    socket: Object,
    gameWidth: Number
  },
  data() {
    return {
      board: [],
      status: '',
      inputSize: 25,
      size: 25,
      mines: 100,
      time: 0,
      flags: 0,
      revealed: 0,
      counter: null
    }
  },
  created() {
  },
  mounted() {
    this.socket.on('minesweeper-board', (data) => {
      this.setBoard(data)
      this.$nextTick(() => {
        this.revealed = document.querySelectorAll('.normal').length
      })
    })
    this.socket.on('minesweeper-update-space', (x, y, value) => {
      this.board[x * this.size + y] = value
      this.$nextTick(() => {
        this.revealed = document.querySelectorAll('.normal').length
        this.flags = document.querySelectorAll('.flag').length
      })
    })
  },
  unmounted() {
    this.socket.off('minesweeper-board')
    this.socket.off('minesweeper-update-space')
    clearInterval(this.counter)
  },
  methods: {
    emit(type, data) {
      this.socket.emit('action', type, data)
    },
    /** Makes a game of minesweeper */
    minesweeper() {
      this.size = this.inputSize
      this.emit('minesweeper-init', {
        size: this.size,
        bombs: this.mines
      })
    },
    setBoard(res) {
      this.board = res.board.reduce((acc, cur) => acc.concat(cur), [])
      this.status = res.status
      this.mines = res.mines
      this.size = res.size
      this.time = res.time
      if (this.status !== 'ongoing') {
        clearInterval(this.counter)
      } else if (!this.counter) {
        this.counter = setInterval(this.tick, 1000)
      }
    },
    revealSpace(i) {
      if (this.status !== 'ongoing') {
        return
      }
      this.emit('minesweeper-reveal', {
        y: i % this.size,
        x: Math.floor(i / this.size)
      })
    },
    flagSpace(i) {
      if (this.status !== 'ongoing') {
        return
      }
      this.emit('minesweeper-flag', {
        y: i % this.size,
        x: Math.floor(i / this.size)
      })
    },
    tick() {
      ++this.time
    }
  },
  computed: {
    cellSize() {
      return `${(this.gameWidth - 44) / this.size - 2}px`
    }
  }
}
</script>

<style scoped>
h2 {
  text-align: center;
}

#minesweeper-board {
  display: grid;
  min-width: 400px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  position: relative;
  background-color: gray;
  font-family: "Courier New", monospace;
  font-weight: bold;
}

#minesweeper-info {
  display: flex;
  justify-content: space-between;
}

#minesweeper-info p {
  display: inline;
}

.space {
  border: 1px solid gray;
  background-color: lightgray;
  text-align: center;
}

.space :deep() svg {
  display: block;
}

.space::selection {
  background: none;
}

.normal {
  background-color: darkgray;
}

.win .space {
  border: 1px solid green;
  background-color: lightgreen;
}

.lose .space {
  border: 1px solid red;
  background-color: pink;
}

.hidden:hover {
  cursor: pointer;
}

.flag:hover {
  cursor: not-allowed;
}

.normal:hover {
  cursor: default;
}

#options {
  display: grid;
  grid-template-columns: auto 300px;
  grid-template-rows: auto;
  grid-template-areas: 
    "input button"
    "input button";
  margin-bottom: 8px;
}

input {
  grid-area: input;
}

button {
  grid-area: button;
}

</style>
