<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel">
    <template v-slot:title>
      Zone {{ state.name }} Danger Map
    </template>
    <template v-slot:description>
      A map indicating dangerous areas in Zone {{ state.name }}. Please move the payload out of danger
    </template>
    <template v-slot:content>
      <div class="relative top-1/2 -translate-y-2/4">
        <div class="flex justify-center" v-for="row in board">
          <span 
            v-for="num in row"
            class="h-10 w-10 border border-gray-700" 
            :class="[num === 0 ? 'bg-error' : 'bg-emerald-500']"
          ></span>
        </div>
      </div>
    </template>
  </Panel>
  <Panel
    v-else-if="panel === 'p'" 
    :active="active" 
    :panel-type="panel"
    @send-solution="sendSolution"
  >
    <template v-slot:title >
      Zone {{ state.name }}
    </template>
    <template v-slot:description >
      Zone {{ state.name }} controller card. Use to move the payload to a safe location.
    </template>
    <template v-slot:content>
      <div class="relative top-1/2 -translate-y-2/4">
        <template v-if="active">
          <button 
            class="absolute left-1 top-0 bottom-0 w-8 h-16 my-auto text-center" 
            @click.prevent="tryMove(-1, 0)" 
            @touchstart.prevent="tryMove(-1, 0)"
          >
            <i class="bi-arrow-left-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button class="absolute right-1 top-0 bottom-0 w-8 h-16 my-auto rounded text-center"
            @click.prevent="tryMove(1, 0)"
            @touchstart.prevent="tryMove(1, 0)"
          >
            <i class="bi-arrow-right-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button class="absolute -top-9 left-0 right-0 h-8 w-16 mx-auto rounded text-center"
            @click.prevent="tryMove(0, -1)"
            @touchstart.prevent="tryMove(0, -1)"
          >
            <i class="bi-arrow-up-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button class="absolute -bottom-8 left-0 right-0 h-8 w-16 mx-auto rounded text-center"
            @click.prevent="tryMove(0, 1)"
            @touchstart.prevent="tryMove(0, 1)"
          >
            <i class="bi-arrow-down-circle-fill text-gray-400 text-3xl"></i>
          </button>
        </template>
        <div>
          <div class="flex justify-center" v-for="row in board">
            <span 
              v-for="num in row"
              class="w-10 h-10 border border-gray-700" 
              :class="[num === 1 ? 'bg-amber-200' : 'bg-gray-600']"
            ></span>
          </div>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "DangerPanel",
  props: {
    panel: String,
    state: Object,
    active: Boolean
  },
  components: {
    Panel
  },
  data() {
    return {
      board: this.state.board,
      current: 0,
      x: 0,
      y: 0
    }
  },
  methods: {
    tryMove(x, y) {
      const newBoard = Array.from({ length: this.board.length }, () => Array(this.board[0].length).fill(0))
      const width = this.board[0].length
      const height = this.board.length
      for (let i = 0; i < height; i++) {
        const resY = i + y
        for (let j = 0; j < width; j++) {
          const resX = j + x
          if (this.board[i][j] === 1) {
            if (resY < 0 || resY >= height || resX < 0 || resX >= width) {
              return
            } else {
              newBoard[resY][resX] = 1
            }
          }
        }
      }
      this.board = newBoard
      this.x += x
      this.y += y
    },
    sendSolution() {
      this.$emit('submit', {
        x: this.x,
        y: this.y
      })
    }
  }
}
</script>

<style scoped></style>