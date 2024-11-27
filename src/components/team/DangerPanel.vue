<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      {{ state.name }} Storage
    </template>
    <template v-slot:description>
      Storage shelf with missing items in Zone {{ state.name }}. The numbers indicate how many items should be in each row or column.
    </template>
    <template v-slot:content>
      <div class="mt-4">
        <div class="flex text-xl justify-center">
          <div v-for="num in state.cols" class="w-10 text-center">
            {{ num }}
          </div>
        </div>
        <div class="border-4 border-gray-500 mx-10">
          <div
            v-for="(row, i) in board" 
            class="flex justify-center"
          >
            <div class="i text-xl mr-2 absolute left-5">
              {{ state.rows[i] }}
            </div>
            <div class="flex justify-center text-center text-amber-600 text-3xl relative">
              <span 
                v-for="(item, j) in row"
                class="cell h-10 min-w-10"
                :data-id="i * 4 + j"
              >
                <i v-if="item" class="bi-box2-fill relative z-10"></i>
              </span>
              <div class="absolute w-full h-1 bg-gray-500 bottom-0"></div>
            </div>
          </div>
      
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
      Storage Zone {{ state.name }}
    </template>
    <template v-slot:description >
      Misplaced packages in Zone {{ state.name }}. Use the arrows to move the items back to where they should be.
    </template>
    <template v-slot:content>
      <div class="relative top-1/2 -translate-y-2/4">
        <div :class="{
          'pointer-events-none': !active
        }">
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
        </div>
        <div class="border-4 border-gray-500 mx-10">
          <div v-for="row in board" class="flex justify-center text-center text-amber-500 text-3xl relative">
            <span 
              v-for="item in row"
              class="cell min-w-10 h-10"
            >
              <i v-if="item" class="bi-box2"></i>
            </span>
            <div class="absolute w-full h-1 bg-gray-500 bottom-0"></div>
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
      const newBoard = Array.from({ length: this.board.length }, () => Array(this.board[0].length).fill(false))
      const width = this.board[0].length
      const height = this.board.length
      for (let i = 0; i < height; i++) {
        const resY = i + y
        for (let j = 0; j < width; j++) {
          const resX = j + x
          if (this.board[i][j]) {
            if (resY < 0 || resY >= height || resX < 0 || resX >= width) {
              return
            } else {
              newBoard[resY][resX] = true
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

<style scoped>
.cell i, .i {
  line-height: 40px;
}
</style>