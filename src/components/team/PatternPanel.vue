<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Key Pattern
    </template>
    <template v-slot:description>
      The key pattern for the {{ state.color }} {{ state.symbol }} puzzle.
    </template>
    <template v-slot:content>
      <div 
        class="relative top-1/2 -translate-y-2/4 gap-1 flex flex-col"
      >
        <div
          v-for="row in board" 
          class="flex justify-center mx-auto text-center text-3xl gap-1"
        >
          <span 
            v-for="lit in row"
            class="cell h-12 w-12 bg-gray-700 rounded"
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
      Click a panel to light up all adjacent lights. Someone else may have a key.
    </template>
    <template v-slot:content>
      <div 
        class="relative top-1/2 -translate-y-2/4 gap-1 flex flex-col"
      >
        <div
          v-for="(row, i) in board" 
          class="flex justify-center mx-auto text-center text-3xl gap-1"
        >
          <span 
            v-for="(lit, j) in row"
            class="cell h-12 w-12 bg-gray-700 rounded cursor-pointer"
            :style="[lit ? `background-color: ${state.color}` : '']"
            @pointerdown.stop="tryMove(j, i)"
          >
            <i class="opacity-50 text-gray-700" :class="[`bi-${state.symbol}`]"></i>
          </span>
        </div>
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
    return {
      board: this.state.board,
      current: 0,
      x: 0,
      y: 0,
      touching: -1
    }
  },
  methods: {
    tryMove(x, y) {
      if (!this.active) {
        return
      }
      const adjacents = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]
      adjacents.forEach(([dx, dy]) => {
        if (x + dx >= 0 && x + dx < 3 && y + dy >= 0 && y + dy < 3) {
          this.board[y + dy][x + dx] = !this.board[y + dy][x + dx]
        }
      })
    },
    sendSolution() {
      this.$emit('submit', {
        board: this.board
      })
    }
  }
}
</script>

<style scoped>
.cell {
  transition: background-color 0.1s ease-out;
}
.cell i {
  line-height: 48px;
}
</style>