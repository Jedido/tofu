<template>
  <div id="minesweeper">
    <h2>Minesweeper</h2>
    <p>Board size (default 25): <input v-model="inputSize" type="number" id="mine-size" min="5" max="50"></p>
    <p>Mines (default 100): <input v-model="mines" type="number" id="mine-mines" min="1" max="2499"></p>
    <button @click="minesweeper" id="play-minesweeper">New Game</button>
    <p id="message">{{ message }}</p>
    <div id="minesweeper-board" :class="status" :style="{
      'grid-template-rows': `repeat(${size}, 1fr)`,
      'grid-template-columns': `repeat(${size}, 1fr)`,
      'fontSize': cellSize,
      'lineHeight': cellSize
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
    socket: Object
  },
  data() {
    return {
      board: [],
      status: '',
      inputSize: 25,
      size: 25,
      mines: 100,
      message: 'Click "Play" to start a game, or "Join" to join an existing game.',
      time: 0,
      counter: null
    }
  },
  mounted() {
    this.socket.on('minesweeper-board', (data) => {
      this.setBoard(data)
    })
    this.socket.on('minesweeper-update-space', (x, y, value) => {
      this.board[x * this.size + y] = value
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
    join() {
      // Start timer
      if (this.counter !== null) {
        clearInterval(this.counter)
      }
      this.time = 0
      this.counter = setInterval(this.tick, 1000)
      this.emit('minesweeper-get-board')
    },
    setBoard(res) {
      this.board = res.board.reduce((acc, cur) => acc.concat(cur), [])
      this.status = res.status
      this.mines = res.mines
      this.size = res.size
      if (this.status !== 'ongoing') {
        clearInterval(this.counter)
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
      this.message = `Time: ${++this.time}`
    }
  },
  computed: {
    cellSize() {
      return `${600 / this.size - 1}px`
    }
  }
}
</script>

<style scoped>
#message {
    text-align: center;
}

#minesweeper-board {
    display: grid;
    width: 620px;
    height: 620px;
    padding: 10px;
    background-color: gray;
    font-family: "Courier New", monospace;
    font-weight: bold;
}

.space {
    display: inline;
    border: 1px solid gray;
    background-color: lightgray;
    text-align: center;
}

.space :deep() svg {
    width: 100%;
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
</style>
