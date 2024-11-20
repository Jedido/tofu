<template>
  <div id="team" class="select-none">
    <div
      v-if="state === 'menu'"
      class="px-8 py-4 bg-white"
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
          @click.prevent="emit('start')"
        >
          Start
        </button>
      </div>
    </div>
    <div v-else-if="state === 'game'" class="relative">
      <div v-show="blackout" class="blackout fixed bg-gray-900 w-screen z-40 pointer-events-none"></div>
      <div class="bg-gray-500 w-80 mx-auto rounded-xl border-gray-900 pt-2 mt-1 relative shadow-lg">
        <div class="absolute -left-1 -right-1 -z-10 flex flex-col">
          <DynamiteStick />
          <DynamiteStick />
        </div>
        <div class="grid grid-cols-3 bomb-panels">
          <BombPanel :wires="wires.slice(0, 3)" @cut="cutWire" />
          <div class="mx-auto w-fit px-2 text-center py-1 bg-gray-900 font-mono text-4xl border border-4 border-gray-400 shadow shadow-inner">
            <span 
              class="relative z-50"
              :class="{
                'text-emerald-300': !bombActive,
                'text-amber-300': bombActive && timeLeft >= 60,
                'text-error': bombActive && timeLeft < 60
              }"
            >{{ timeDisplay }}</span>
            <div class="mx-auto mt-2 bg-gray-900 flex w-fit justify-center gap-2 rounded text-sm">
              <i v-for="_ in cuts" class="bi-check-circle-fill text-emerald-400"></i>
              <i v-for="_ in quota - cuts" class="bi-check-circle-fill text-gray-700"></i>
            </div>
          </div>
          <BombPanel :wires="wires.slice(3)" @cut="(i) => cutWire(i + 3)" flip />
        </div>
        <div class="w-full pl-7 pr-3 bg-gray-700 py-2 mt-2 relative left-0 right-0 mx-auto rounded-xl flex">
          <div class="grow bg-gray-900 h-1 rounded-lg shadow-inner"></div>
          <i class="bi-dot leading-none -my-2"></i>
        </div>
      </div>
      <div
        id="panel-collection"
        class="flex flex-nowrap justify-center gap-2 relative overflow-y-none mb-56"
        @touchend.prevent="touchStack"
        @pointermove.prevent="(e) => this.hovering = this.getTouchingPanel(e.clientX, e.clientY)"
        @pointerleave="this.hovering = -1"
      >
        <PanelType
          v-for="(stack, i) in stacks"
          :id="`panel${i}`"
          :current-panel="currentPanel(i)"
          :active="i === selectedStack"
          class="panel relative z-20 shadow-2xl"
          :class="{ 'selected-panel': i === selectedStack }"
          :style="[i !== selectedStack ? cardMargin : 'top: -12px;', `order: ${order[i]}`]"
          :hover="i === hovering"
          @submit="(solution) => submitSolution(solution, i)"
          @dismiss="dismiss(stack)"
          @reset="reset(stack)"
          @select="selectStack(i)"
        />
      </div>
    </div>
    <div v-else-if="state === 'win'">
      <div class="px-8 py-4 bg-white">
        <div>Level {{ level }} complete! Time remaining: {{ timeDisplay }}</div>
        <button
          class="
            mt-4
            py-4
            w-full
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
            col-span-6
          "
          @click.prevent="emit('next')"
        >
          Next
        </button>
      </div>
    </div>
    <div v-else-if="state === 'lose'">
      <div class="px-8 py-4 bg-white">
        <div>You lost on level {{ level }}! Cause of explosion: {{ causeOfDeath }}</div>
        <button
          class="
            mt-4
            py-4
            w-full
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
            col-span-6
          "
          @click.prevent="state = 'menu'"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import PanelType from "./PanelType.vue"
import BombPanel from "./BombPanel.vue";
import DynamiteStick from "./DynamiteStick.vue";

const handWidth = 256;

export default {
  name: "TeamGame",
  mixins: [socket],
  components: {
    PanelType,
    BombPanel,
    DynamiteStick
  },
  data() {
    return {
      state: "menu",
      selectedStack: 0,
      level: 1,
      hovering: -1,
      cuts: 0,
      revealed: [],
      pendingResults: [],
      stacks: [[{
        id: 1,
        puzzle: "r",
        panel: "p",
        state: {
          name: "Rawynris"
        }
      }],[{
        id: 1,
        puzzle: "r",
        panel: "k1",
        state: {
          requestors: [{
            name: "Nalenyna",
            sequence: [1, 3, 1, 3]
          }, {
            name: "Filenven",
            sequence: [3, 3, 2, 0]
          }, {
            name: "Luleniel",
            sequence: [2, 3, 1, 0]
          }, {
            name: "Rawynris",
            sequence: [0, 1, 2, 3]
          }]
        }
      }]],
      order: [0],
      blackout: false,
      quota: 4,
      causeOfDeath: "",
      timeTotal: 1000,
      timeStart: Date.now(),
      timeLeft: 0,
      timer: null,
      bombActive: false,
      wires: []
    }
  },
  mounted() {
    this.on("start", ({ stacks, wires, quota, level, time, timeStart }) => {
      this.blackout = true
      setTimeout(() => {
        this.blackout = false
        this.bombActive = true
      }, 3000)
      this.state = "game"
      this.cuts = 0
      this.stacks = stacks
      this.wires = wires
      this.quota = quota
      this.timeTotal = time
      this.timeStart = timeStart
      this.level = level
      this.order = []
      clearInterval(this.timer)
      this.timer = setInterval(this.refreshTimer, 40)
      for (let i = 0; i < stacks.length; i++) {
        this.order.push(i)
      }
    })
    this.on("cut-success", ({ next, success }) => {
      this.wires[next].cut = true
      if (success) {
        this.cuts++
      }
    })
    this.on("win", () => {
      clearInterval(this.timer)
      // play audio
      this.bombActive = false
      setTimeout(() => {
        this.state = "win"
      }, 5000)
    })
    this.on("lose", ({ cause }) => {
      this.cuts = 0
      this.causeOfDeath = cause
      clearInterval(this.timer)
      this.bombActive = false
      this.state = "lose"
    })
    this.on("solve", ({ id }) => {
      this.revealed.push(id)
    })
    this.on("result", this.handleResult)
  },
  unmounted() {
    clearInterval(this.timer)
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
    touchStack(e) {
      const touched = this.getTouchingPanel(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      if (touched === -1) {
        return
      }
    },
    selectStack(i) {
      if (this.selectedStack !== i) {
        let position = this.order[i]
        const oldPosition = this.order[this.selectedStack]
        document.getElementById(`panel${this.selectedStack}`).style.left = '0px'
        if (i > oldPosition) {
          position--
        }
        const panel = document.getElementById(`panel${i}`)
        this.order[this.selectedStack] = this.order[i]
        this.order[i] = oldPosition
        this.selectedStack = i
        panel.style.left = 'calc(50% - 128px)'
      }
    },
    submitSolution(solution, i) {
      const currentPanel = this.stacks[i][0]
      this.emit('submit', {
        stack: i,
        id: currentPanel.id,
        type: currentPanel.puzzle,
        data: solution
      })
    },
    currentPanel(i) {
      const stack = this.stacks[i];
      if (stack.length > 0) {
        return stack[0]
      } else {
        return {}
      }
    },
    handleResult({ stack, id, result }) {
      const panel = this.stacks[stack][0]
      if (panel.id === id) {
        panel.status = result
      } else {
        console.log("Double submission detected! ignoring...")
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
    },
    cutWire(e) {
      this.emit('cut', { next: e })
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
.bomb-panels {
  grid-template-columns: 1fr auto 1fr;
}
.selected-panel {
  transition: top 0.2s ease-out, scale 0.1s linear;
  position: absolute;
  scale: 1;
  z-index: 30;
  padding-top: 20px;
}
@keyframes blackout {
  0% {
    opacity: 98%;
  }
  45% {
    opacity: 98%;
  }
  50% {
    opacity: 0%;
  }
  55% {
    opacity: 98%;
  }
  85% {
    opacity: 98%;
  }
  100% {
    opacity: 0%;
  }
}
.blackout { 
  height: calc(100vh - 4px);
  opacity: 99%;
  left: 50%;
  transform: translate(-50%, -36px);
  animation: 1s blackout 2s forwards;
}
</style>