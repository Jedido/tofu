<template>
  <div id="minesweeper">
    <h2>Minesweeper</h2>
    <p>Board size (default 25): <input v-model="inputSize" type="number" id="mine-size" min="5" max="50"></p>
    <p>Mines (default 100): <input v-model="mines" type="number" id="mine-mines" min="1" max="2499"></p>
    <button @click="minesweeper" id="play-minesweeper">Play</button>
    <button @click="join" id="join-minesweeper">Join</button>
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
  data() {
    return {
      board: [],
      status: '',
      inputSize: 25,
      size: 25,
      mines: 100,
      message: 'Click "Play" to start a game, or "Join" to join an existing game.',
      time: 0,
      counter: null,
      boardRefresh: null
    }
  },
  unmounted() {
    clearInterval(this.counter)
    clearInterval(this.boardRefresh)
  },
  methods: {
    /** Makes a game of minesweeper */
    async minesweeper() {
      this.size = this.inputSize
      await this.axios.$post('/minesweeper/init', {
        size: this.size,
        bombs: this.mines
      })
      this.join()
    },
    join() {
        // Start timer
        if (this.counter !== null) {
            clearInterval(this.counter)
        }
        this.time = 0
        this.counter = setInterval(this.tick, 1000)
        this.getBoard()
    },
    async getBoard() {
      const res = await this.axios.$get('/minesweeper/board')
      this.board = res.board.reduce((acc, cur) => acc.concat(cur), [])
      this.status = res.status
      this.mines = res.mines
      this.size = res.size
      if (this.boardRefresh) {
          clearInterval(this.boardRefresh)
      }
      if (this.status === 'lose' || this.status === 'win') {
          clearInterval(this.counter)
          clearInterval(this.boardRefresh)
      } else {
        this.boardRefresh = setTimeout(this.getBoard, 3000)
      }
    },
    async revealSpace(i) {
      if (this.status === 'lose' || this.status === 'win') {
          return
      }
      await this.axios.$post('/minesweeper/reveal', {
        y: i % this.size,
        x: Math.floor(i / this.size)
      })
      this.getBoard()
    },
    async flagSpace(i) {
      if (this.status === 'lose' || this.status === 'win') {
          return
      }
      await this.axios.$post('/minesweeper/flag', {
        y: i % this.size,
        x: Math.floor(i / this.size)
      })
      this.getBoard()
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

.space >>> svg {
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
