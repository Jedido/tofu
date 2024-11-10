<template>
  <div id="team" class="select-none">
    <div
      v-if="state === 'menu'"
      :class="[
        'px-8 py-4 bg-white',
      ]"
    >
      <h2 class="text-2xl text-center">Team</h2>
      <p class="font-semibold text-lg">Instructions</p>
      <div class="grid grid-cols-6 gap-2 w-full select-none">
        <p class="col-span-4 ml-auto">You will face danger. Help each other get through the danger.</p>
        <button
          class="
            mt-4
            py-4
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
            col-span-6
          "
          @click.prevent="startGame()"
        >
          Start
        </button>
      </div>
    </div>
    <div v-else class="relative">
      <div class="bg-gray-500 w-80 mx-auto p-2 rounded-lg border border-4 border-gray-900">
        <div class="mx-auto w-48 text-center p-2 bg-gray-900 text-error font-mono text-6xl border border-4 border-gray-700">
          {{ timeDisplay }}
        </div>
        <div class="mx-auto mt-2 bg-gray-900 flex px-3 py-1 w-fit justify-center gap-3 rounded text-xl">
          <i v-for="_ in strikes" class="bi-x-circle-fill text-error"></i>
          <i v-for="_ in 5 - strikes" class="bi-check-circle-fill text-emerald-400"></i>
        </div>
        <div class="w-72 px-3 bg-gray-700 py-1 mt-2 relative left-0 right-0 mx-auto rounded-xl">
          <div class="bg-gray-900 py-1 rounded-lg"></div>
        </div>
      </div>
      <div
        id="panel-collection"
        class="flex flex-nowrap justify-center gap-2 relative overflow-y-none"
        @touchend="touchStack"
        @pointermove="(e) => this.hovering = this.getTouchingPanel(e.clientX, e.clientY)"
        @pointerleave="this.hovering = -1"
      >
        <PanelType
          v-for="(stack, i) in stacks"
          :id="`panel${i}`"
          :current-panel="currentPanel(i)"
          :active="i === selectedStack"
          class="panel relative z-20 shadow-2xl"
          :class="{ 'selected-panel': i === selectedStack, 'panel-hover': i === hovering }"
          :style="[i !== selectedStack ? cardMargin : '', `order: ${order[i]}`]"
          @click="(e) => selectStack(e, i)"
          @submit="(solution) => submitSolution(solution, i)"
          @dismiss="() => dismiss(stack)"
          @reset="() => reset(stack)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import PanelType from "./PanelType.vue"
import 'bootstrap-icons/font/bootstrap-icons.css'

const handWidth = 300;

export default {
  name: "TeamGame",
  mixins: [socket],
  components: {
    PanelType
  },
  data() {
    let i = 0;
    const mock = () => {
      return { "id": i++, "puzzle": "d", "panel": "k1",
          "state": { "name": "R-14","board": [[1,1,1,1],[1, 1, 1,1 ],[1,0,1,1],[0,0, 1, 1]]}}
    }
    const puzzle = () => {
      return { "id": i++, "puzzle": "d", "panel": "p",
          "state": { "name": "R-14","board": [[1,1,1,1],[1, 1, 1,1 ],[1,1,1,1],[1,1, 1, 1]]}}
    }
    return {
      state: "game",
      selectedStack: 0,
      hovering: -1,
      strikes: 0,
      revealed: [],
      pendingResults: [],
      stacks: [[puzzle(), mock(), mock(), mock()], [], [mock()], [], [], []],
      order: [0, 1, 2, 3, 4, 5],
      timeTotal: 15,
      timeStart: Date.now(),
      timeLeft: 0,
      timer: null
    }
  },
  mounted() {
    this.on("stacks", (stacks) => {
      this.state = "game"
      this.stacks = stacks
      this.order = []
      for (let i = 0; i < stacks.length; i++) {
        this.order.push(i)
      }
    })
    this.on("strike", ({ id }) => {
      strikes++
    })
    this.on("solve", ({ id }) => {
      this.revealed.push(id)
    })
    this.on("result", (result) => {
      this.pendingResults.push(result)
    })
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.timer = setInterval(this.refreshTimer, 40)
  },
  methods: {
    getTouchingPanel(x, y) {
      const touchedElement = document.elementFromPoint(x, y)
      if (touchedElement) {
        let panel = touchedElement;
        while (panel != null && !/panel\d+/.test(panel.id) && panel.id !== 'panel-collection') {
          panel = panel.parentNode
        }
        if (panel && /panel\d+/.test(panel.id)) {
          return parseInt(panel.id.substring(5))
        }
      }
      return -1
    },
    startGame() {
      this.emit("start")
    },
    touchStack(e) {
      const touched = this.getTouchingPanel(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      if (touched === -1) {
        return
      }
      this.selectStack(e, touched)
    },
    selectStack(e, i) {
      if (this.selectedStack !== i) {
        e.preventDefault()
        let position = this.order[i]
        const oldPosition = this.order[this.selectedStack]
        if (i > oldPosition) {
          position--
        }
        const panel = document.getElementById(`panel${i}`)
        panel.style.left = `calc(50% + ${handWidth * (position / (this.stacks.length - 1) - 0.5)}px)`
        this.order[this.selectedStack] = this.order[i]
        this.order[i] = oldPosition
        this.selectedStack = i
        setTimeout(() => {
          panel.style.left = null
        }, 1)
      }
    },
    submitSolution(solution, i) {
      const currentPanel = this.stacks[i][0]
      this.emit('submit', {
        id: currentPanel.id,
        type: currentPanel.puzzle,
        data: solution
      })
      setTimeout(() => this.awaitResponse(i), 3000)
    },
    currentPanel(i) {
      const stack = this.stacks[i];
      if (stack.length > 0) {
        return stack[0]
      } else {
        return {}
      }
    },
    awaitResponse(i) {
      const stack = this.stacks[i]
      if (stack.length === 0) {
        return
      }
      const panel = stack[0]
      const resultIndex = this.pendingResults.findIndex(res => panel.id === res.id)
      if (resultIndex >= 0) {
        const { result } = this.pendingResults.splice(resultIndex, 1)[0]
        panel.status = result
      } else {
        setTimeout(() => {
          console.log('Server is taking a long time to respond!')
          this.awaitResponse(i)
        }, 1000)
      }
    },
    dismiss(stack) {
      if (stack[0].status === 'success') {
        stack.shift()
      }
    },
    reset(stack) {
      stack[0].status = 'pending'
    },
    refreshTimer() {
      const elapsed = Date.now() - this.timeStart
      this.timeLeft = this.timeTotal - elapsed / 1000
      if (this.timeLeft < 0 || this.state !== 'game') {
        this.timeLeft = 0
        clearInterval(this.timer)
      }
    }
  },
  computed: {
    cardMargin() {
      const num = Math.max(this.stacks.length - 1, 1)
      const spacePerCard = handWidth / num
      const cardSize = 256
      const space = (spacePerCard - cardSize) / 2
      return `margin: 0 ${space}px`
    },
    timeDisplay() {
      if (this.timeLeft > 60) {
        const minutes = String(parseInt(this.timeLeft / 60)).padStart(2, '0')
        const seconds = String(parseInt(this.timeLeft % 60)).padStart(2, '0')
        return `${minutes}:${seconds}`
      }
      return String(this.timeLeft.toFixed(2)).padStart(5, '0')
    }
  }
}
</script>

<style scoped>
.panel {
  transition: top 0.2s linear;
  transform: scale(0.5);
  top: 320px;
  left: none;
  overflow-y: hidden;
}
.panel-hover {
  top: 300px;
  cursor: pointer;
  z-index: 30;
}
.selected-panel {
  transition: transform 0.2s linear, top 0.3s linear, left 0.19s linear, margin 0.2s linear;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: scale(1) translateX(-50%);
  z-index: 40;
  padding-top: 30px;
  margin-top: 8px;
}
</style>