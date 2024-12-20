<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Key Pattern
    </template>
    <template v-slot:description>
      The key pattern for the {{ state.color }} {{ state.symbol }} puzzle. Match up all colored panels.
    </template>
    <template v-slot:content>
      <div 
        class="relative text-center w-44 mx-auto top-1/2 -translate-y-2/4 text-3xl py-3 px-1 bg-gray-300 rounded flex flex-col gap-1"
      >
        <div
          v-for="row in board" 
          class="flex justify-center mx-auto text-3xl gap-1 px-1"
        >
          <span 
            v-for="lit in row"
            class="cell h-12 w-12 bg-gray-50 rounded border-2 border-gray-700"
            :style="[lit ? `background-color: ${state.color}` : '']"
          >
            <i v-if="lit" class="opacity-50" :class="[`bi-${state.symbol}`]"></i>
          </span>
        </div>
      </div>
    </template>
  </Panel>
  <Panel
    v-else-if="panel === 'p'"
    :active="active"
    :panel-type="panel"
    @submit="sendSolution"
  >
    <template v-slot:title >
      {{ state.color }} {{ state.symbol }} Pattern
    </template>
    <template v-slot:description >
      Touch to slide the panels to the empty space. Someone else may have a key.
    </template>
    <template v-slot:content>
      <div class="relative text-center w-44 mx-auto top-1/2 -translate-y-2/4 text-3xl py-3 px-1 bg-gray-300 rounded">
        <div class="flex flex-col gap-1 px-2">
          <div v-for="row in board" class="flex gap-1">
            <div v-for="_ in row" class="h-12 w-12 bg-gray-500 rounded"></div>
          </div>
        </div>
        <template v-for="(row, i) in board">
          <template v-for="(lit, j) in row">
            <div
              v-if="i !== 2 || j !== 2"
              class="cell h-12 w-12 rounded absolute top-0 left-0 bg-gray-50 cursor-pointer border-2 border-gray-700"
              :style="[lit ? `background-color: ${state.color};` : '', calculatePosition(j, i)]"
              @pointerdown.stop="tryMove(j, i)"
            >
              <i v-if="lit" class="opacity-50 text-gray-700" :class="[`bi-${state.symbol}`]"></i>
            </div>
          </template>
        </template>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "PatternPanel",
  props: {
    panel: String,
    state: Object,
    active: Boolean
  },
  components: {
    Panel
  },
  emits: {
    'submit': false
  },
  data() {
    const boardOffset = Array.from(this.state.board, (row, i) => Array.from({ length: row.length }, (_, j) => {
      return { i, j }
    }))
    return {
      board: this.state.board,
      boardOffset,
      touching: -1
    }
  },
  methods: {
    tryMove(x, y) {
      if (!this.active) {
        return
      }
      const old = this.boardOffset[2][2]
      const { i, j } = this.boardOffset[y][x]
      if (Math.abs(old.i - i) + Math.abs(old.j - j) === 1) {
        this.boardOffset[y][x] = { i: old.i, j: old.j }
        this.boardOffset[2][2] = { i, j }
      }
    },
    sendSolution() {
      const board = Array.from(this.state.board, (row) => Array.from({ length: row.length }, () => false))
      for (let y = 0; y < this.boardOffset.length; y++) {
        const row = this.boardOffset[y]
        for (let x = 0; x < row.length; x++) {
          const { i, j } = row[x]
          board[i][j] = this.board[y][x]
        }
      }
      this.$emit('submit', { board })
    },
    calculatePosition(x, y) {
      const { i, j } = this.boardOffset[y][x]
      return `transform: translate(${12 + j * 52}px, ${12 + i * 52}px);`
    }
  }
}
</script>

<style scoped>
.cell {
  transition: transform 0.1s ease-out;
}
.cell i {
  line-height: 48px;
}
</style>