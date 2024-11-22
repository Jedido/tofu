<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Zone {{ state.name }} Danger Map
    </template>
    <template v-slot:description>
      A map indicating dangerous cells in Zone {{ state.name }}. Touch a cell to briefly reveal its contents.
    </template>
    <template v-slot:content>
      <div class="relative top-1/2 -translate-y-2/4">
        <div
          v-for="(row, i) in board" 
          class="flex justify-center mx-auto text-center text-gray-300 text-3xl"
          @touchstart.prevent="startHover"
          @touchmove.prevent="startHover"
          @touchend.prevent="endHover"
        >
          <span 
            v-for="(num, j) in row"
            class="cell h-10 w-10 bg-gray-300 border border-gray-400 rounded hover:text-error hover:bg-gray-50"
            :data-id="i * 4 + j"
            :class="{
              'hover_effect text-error bg-gray-50': touching == i * 4 + j,
              'pointer-events-none': !active
            }"
            @pointerdown.stop=""
          >
            <i v-if="num === 0" class="bi-radioactive"></i>
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
      Zone {{ state.name }}
    </template>
    <template v-slot:description >
      Zone {{ state.name }} controller card. Use the arrows to move the payload to a safe location.
    </template>
    <template v-slot:content>
      <div class="relative top-1/2 -translate-y-2/4">
        <template v-if="active">
          <button 
            class="absolute left-1 top-0 bottom-0 w-8 h-16 my-auto text-center" 
            @pointerdown.stop="tryMove(-1, 0)"
          >
            <i class="bi-arrow-left-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button
            class="absolute right-1 top-0 bottom-0 w-8 h-16 my-auto rounded text-center"
            @pointerdown.stop="tryMove(1, 0)"
          >
            <i class="bi-arrow-right-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button 
            class="absolute -top-9 left-0 right-0 h-8 w-16 mx-auto rounded text-center"
            @pointerdown.stop="tryMove(0, -1)"
          >
            <i class="bi-arrow-up-circle-fill text-gray-400 text-3xl"></i>
          </button>
          <button 
            class="absolute -bottom-8 left-0 right-0 h-8 w-16 mx-auto rounded text-center"
            @pointerdown.stop="tryMove(0, 1)"
          >
            <i class="bi-arrow-down-circle-fill text-gray-400 text-3xl"></i>
          </button>
        </template>
        <div>
          <div class="flex justify-center text-emerald-500 text-3xl text-center" v-for="row in board">
            <span 
              v-for="num in row"
              class="cell w-10 h-10 border border-dashed border-gray-600 rounded bg-gray-50" 
            >
              <i v-if="num === 1" class="bi-archive-fill"></i>
            </span>
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
    },
    startHover(e) {
      const touch = e.touches[0]
      let element = document.elementFromPoint(touch.clientX, touch.clientY);

      while (element != null && !element.dataset && !element.dataset.id) {
        element = element.parentNode
      }
      if (element != null) {
        this.touching = element.dataset.id
      }
    },
    endHover() {
      this.touching = -1
    }
  }
}
</script>

<style scoped>
.cell {
  transition: color 1.5s ease-in, background-color 1.5s ease-in;
}
.cell:hover, .cell.hover_effect {
  transition: none;
}
.cell i {
  line-height: 40px;
}
</style>