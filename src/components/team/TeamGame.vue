<template>
  <div id="team" class="select-none touch-manipulation overflow-x-clip" @click.prevent="">
    <div
      v-if="state === 'menu'"
      class="px-8 py-4 bg-white mt-2"
    >
      <h2 class="text-2xl text-center font-semibold mb-2">Instructions</h2>
      <div class="grid grid-cols-6 gap-2 w-full select-none">
        <ul class="col-span-6 flex flex-col gap-2">
          <li>
            Defuse the bomb before time runs out. Cutting the wrong wire will result in death!
          </li>
          <li>
            Before you start, ensure that the arrows in the following section fit on the screen. You can adjust the zoom in the settings.
          </li>
          <li>
            All players will receive decks with <span class="text-emerald-700 font-bold">Wire</span> cards, <span class="text-cyan-800 font-bold">Puzzle</span> cards, and <span class="text-gray-800 font-bold">Key</span> cards.
            <ul class="list-disc ml-4">
              <li>
                <span class="text-emerald-700 font-bold">Wire</span> cards contain information on how to defuse the bomb
              </li>
              <li>
                <span class="text-cyan-800 font-bold">Puzzle</span> cards contain a puzzle that must be solved
              </li>
              <li>
                <span class="text-gray-800 font-bold">Key</span> cards contain vital information for solving puzzles
              </li>
            </ul>
          </li>
          <li>
            Submit a card by swiping it upwards:
            <ul class="list-disc ml-4">
              <li>
                <span class="text-emerald-700 font-bold">Wire</span> cards can be submitted at any time, but don't forget the info!
              </li>
              <li>
                <span class="text-cyan-800 font-bold">Puzzle</span> cards are submitted successfully when the puzzle is solved.
                <ul class="list-disc ml-4">
                  <li><i class="bi-check-circle-fill text-emerald-500"></i> means the submission was correct. Tap the card to proceed.</li>
                  <li><i class="bi-x-circle-fill text-error"></i> means the submission was incorrect. Tap the card to try again.</li>
                </ul>
              </li>
              <li>
                <span class="text-gray-800 font-bold">Key</span> cards automatically become <i class="bi-check-circle-fill text-emerald-500"></i> after the corresponding puzzle has been solved.
              </li>
            </ul>
          </li>
        </ul>
        <div class="col-span-6 text-2xl text-center font-semibold mt-2">Examples</div>
        <div class="col-span-6 flex justify-center items-center gap-2 min-w-fit relative left-1/2 -translate-x-2/4 overflow-y-hidden">
          <i class="bi-arrow-left p-4 hover:-translate-x-2 transition-transform text-4xl cursor-pointer" @pointerdown="cycle(-1)"></i>
          <PanelType
            :current-panel="instructionalPanels[selectedStack][0]"
            active
            :socket="socket"
            style="top:0px;scale:1;"
            class="z-20 shadow-2xl"
          />
          <i class="bi-arrow-right p-4 hover:translate-x-2 transition-transform text-4xl cursor-pointer" @pointerdown="cycle(1)"></i>
        </div>
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
    <div v-else-if="state === 'game'" class="relative h-screen overflow-y-hidden">
      <div v-if="blackout" class="blackout fixed bg-gray-900 w-screen h-full -translate-x-2/4 left-1/2 z-40"></div>
      <div class="bg-gray-500 w-80 mx-auto rounded-xl border-gray-900 pt-2 mt-1 relative shadow-lg">
        <div class="absolute -left-1 -right-1 -z-10 flex flex-col">
          <DynamiteStick />
          <DynamiteStick />
        </div>
        <div class="grid grid-cols-3 bomb-panels">
          <BombPanel :wires="wires.slice(0, 3)" @cut="cutWire" />
          <div class="mx-auto w-fit px-2 text-center py-1 bg-gray-900 font-mono text-4xl border-4 border-gray-400 shadow-inner">
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
        class="flex flex-nowrap justify-center gap-2 relative mb-56"
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
          :socket="socket"
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
import confetti from "canvas-confetti"

import socket from "@/mixins/socket.js"
import PanelType from "./PanelType.vue"
import BombPanel from "./BombPanel.vue"
import DynamiteStick from "./DynamiteStick.vue"

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
    const instructionalPanels = [
      [{
        id: 0,
        puzzle: "w",
        panel: "w",
        state: {
          wire: {
            color: "crimson",
            stripe: "orchid"
          },
          order: 2,
          quota: 4
        }
      }], [{
        id: 1,
        puzzle: "p",
        panel: "p",
        state: {
          color: "tomato",
          symbol: "diamond",
          board: [
            [false, false, false],
            [true, true, true],
            [false, true, false]
          ]
        }
      }], [{
        id: 1,
        puzzle: "p",
        panel: "k1",
        state: {
          color: "tomato",
          symbol: "diamond",
          board: [
            [true, true, false],
            [true, false, false],
            [false, true, false]
          ]
        }
      }], [{
        id: 1,
        puzzle: "r",
        panel: "p",
        state: {
          name: "Rawynris"
        }
      }], [{
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
      }], [{
        id: 2,
        puzzle: "d",
        panel: "p",
        state: {
          name: "R-1",
          board: [
            [false, false, false, false],
            [false, false, false, false],
            [false, false, true, true],
            [false, false, true, false]
          ]
        }
      }], [{
        id: 2,
        puzzle: "d",
        panel: "k1",
        state: {
          name: "R-1",
          board: [
            [false, false, true, true],
            [false, false, true, false],
            [false, true, false, false],
            [false, true, true, false]
          ],
          rows: [2, 3, 2, 2],
          cols: [2, 3, 3, 1]
        }
      }], [{
        id: 3,
        puzzle: "m",
        panel: "p",
        state: {
          dice: [1, 2, 3],
          color: "chocolate"
        }
      }], [{
        id: 3,
        puzzle: "m",
        panel: "k1",
        state: {
          dots: new Uint32Array([48000327, 52]),
          count: 3,
          color: "chocolate"
        }
      }], [{
        id: 4,
        puzzle: "f",
        panel: "p",
        state: {
          name: "L-20",
          faces: ["angry", "frown", "heart-eyes", "laughing-fill", "smile", "sunglasses", "wink", "surprise-fill", "dizzy"],
        }
      }], [{
        id: 4,
        puzzle: "f",
        panel: "k1",
        state: {
          name: "L-20",
          type: "face",
          data: ["angry", "laughing-fill"]
        }
      }], [{
        id: 5,
        puzzle: "x",
        panel: "p",
        state: {
          n: 1,
          hint: "a = 8",
          y: "g"
        }
      }], [{
        id: 5,
        puzzle: "x",
        panel: "k1",
        state: {
          x: "a",
          n: 1,
          equations: [{
            color: "red",
            m: 1,
            b: 2,
            y: "b",
            n: 2
          }, {
            color: "blue",
            m: 2,
            b: -4,
            y: "x",
            n: 3
          }, {
            color: "green",
            m: 1,
            b: -3,
            y: "g",
            n: 1
          }],
        }
      }], [{
        id: 6,
        puzzle: "a",
        panel: "p",
        state: {
          name: "Filenven",
          words: [ "WITCH", "ATTACH", "TWIST", "PATCH" ]
        }
      }], [{
        id: 6,
        puzzle: "a",
        panel: "k1",
        state: {
          name: "Filenven",
          letters: "HWCATI"
        }
      }], [{
        id: 7,
        puzzle: "s",
        panel: "p",
        state: {
          streets: [ 'Fox Way', 'Maple Ct', 'Willow Ln', 'Forest Ave' ],
          city: "Crystalhaven"
        }
      }], [{
        id: 7,
        puzzle: "s",
        panel: "k1",
        state: {
          streets: [
            'Magnolia Dr',
            'Fox Way',
            'Forest Ave',
            'Silver Ave',
            'Maple Ct',
            'Willow Ln',
            'Aspen Blvd',
            'Fern Blvd'
          ],
          city: "Crystalhaven"
        }
      }], [{
      }]
    ]
    return {
      state: "menu",
      selectedStack: 0,
      level: 1,
      hovering: -1,
      cuts: 0,
      pendingResults: [],
      instructionalPanels,
      stacks: instructionalPanels,
      order: instructionalPanels.map((_, i) => i),
      blackout: true,
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
    this.on("start", ({ stacks, wires, quota, level, time, timeStart, solved, cut }) => {
      console.log("start event")
      this.blackout = true
      setTimeout(() => {
        this.bombActive = true
        this.blackout = false
      }, 2500)
      this.state = "game"
      this.selectedStack = 0
      this.cuts = 0
      this.stacks = stacks.map(stack => stack.filter(panel => !solved.includes(panel.id)))
      this.wires = wires
      this.quota = quota
      this.timeTotal = time
      this.timeStart = timeStart
      this.level = level
      this.order = []
      for (let w of cut) {
        this.wires[w].cut = true
      }
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
      this.bombActive = false
      this.confetti(10)
    })
    this.on("lose", ({ cause }) => {
      this.cuts = 0
      this.causeOfDeath = cause
      clearInterval(this.timer)
      this.timeLeft = 0
      this.explode(8)
    })
    this.on("solve", ({ id }) => {
      this.stacks.forEach((stack) => {
        stack.forEach((panel) => {
          if (panel.id === id) {
            panel.status = "success"
          }
        })
      })
    })
    this.on("fail", ({ id, stack }) => {
      const panel = this.stacks[stack][0]
      if (panel.id === id) {
        panel.status = "failure"
      }
    })
    this.emit("state")
  },
  unmounted() {
    clearInterval(this.timer)
  },
  methods: {
    cycle(i) {
      this.selectedStack = (i + this.selectedStack + this.instructionalPanels.length) % this.instructionalPanels.length
    },
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
    },
    explode(times) {
      if (times > 0) {
        setTimeout(() => {
          this.explode(times - 1)
        }, 500)
        confetti({
          shapes: [confetti.shapeFromText({ text: '💥', scalar: 20 })],
          particleCount: 10,
          startVelocity: 40,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random()
          },
          gravity: 0,
          scalar: 20,
          decay: 0.9,
          flat: true,
          ticks: 200
        })
      } else {
        setTimeout(() => {
          this.state = "lose"
          confetti({
            shapes: [confetti.shapeFromText({ text: '💥', scalar: 80 })],
            particleCount: 4,
            startVelocity: 40,
            gravity: 0,
            spread: 360,
            scalar: 80,
            flat: true,
            ticks: 100
          })
        }, 1000)
      }
    },
    confetti(times) {
      if (times > 0) {
        confetti({
          particleCount: 50,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.3 },
          startVelocity: 20
        })
        setTimeout(() => {
          this.confetti(times - 1)
        }, 250)
      } else {
        setTimeout(() => {
          this.state = "win"
        }, 1000)
      }
    }
  },
  computed: {
    cardMargin() {
      const num = Math.max(this.stacks.length - 1, 1)
      const spacePerCard = Math.max(handWidth, this.$store.state.gameWidth) / num
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
  opacity: 99%;
  animation: 1s blackout 1.5s forwards;
}
</style>