<template>
  <div id="tile" class="select-none touch-manipulation overflow-x-clip" @pointerdown.prevent="" @touchmove.prevent="">
    <div v-if="state === 'menu'" class="game w-full mt-10 text-white px-4 py-2">
      <h1 class="text-3xl mb-4">Tetris Up!</h1>
      <div>
        <p>In this game, you and your teammates will cooperate to create "tetris" pieces to fulfill orders. If the order time runs out, you lose!</p>
        <p>Each player will be given a different set of tools. To use a tool, select it to activate it, then select a tetris unit.</p>
        <div class="flex justify-around py-4">
          <div>
            <Tool :selected="mode === 'move'" @pointerdown="mode = 'move'">
              <MovementTools :tools="moveOptions" :selected="mode === 'move'" @update-control="updateControl" />
            </Tool>
          </div>
          <div>
            <Tool :selected="mode === 'append'" @pointerdown="mode = 'append'">
              <AppendTools :tools="appendOptions" @update-control="updateControl" />
            </Tool>
          </div>
          <div>
            <Tool :selected="mode === 'paint'" @pointerdown="mode = 'paint'">
              <PaintTools :tools="paintOptions" :selected="mode === 'paint'" @update-control="updateControl" />
            </Tool>
          </div>
          <div>
            <Tool :selected="mode === 'submit'" @pointerdown="mode = 'submit'">
              <SubmitTool @update-control="updateControl" />
            </Tool>
          </div>
        </div>
        <div class="bg-white rounded w-full text-gray-800 px-2 py-1 h-20">
          <template v-if="mode === 'move'">
            Use the move tool to move a unit. Drag a unit in an allowed direction to move it.
            Selecting the move tool again toggles it to rotation mode. In rotation mode, selecting a unit will rotate it.
          </template>
          <template v-else-if="mode === 'append'">
            Use the append tool to add a new block pattern to a unit. If the unit is on the corresponding append station, selecting the unit will append the block pattern.
            The block pattern will be appended to the bottom of the unit, and will overwrite any existing blocks attached to the bottom.
          </template>
          <template v-else-if="mode === 'paint'">
            Use the paint tool to paint a unit. If the unit is on the paint station, selecting the unit will paint it.
            The color will be the current color of the paint tool selected. Selecting the paint tool again toggles it to another color, if available.
          </template>
          <template v-else-if="mode === 'submit'">
            Select a unit while it is on a plain tile to submit it. The submission is valid as long as the unit is in the same shape and color, without regards to orientation.
            However, if the unit does not match any of the current orders, the submission will be destroyed and a new unit will spawn.
          </template>
        </div>
      </div>
      <button class="bg-amber-200 text-gray-800 px-4 py-2 rounded my-2 w-full" @pointerdown="emit('start')">Start Game</button>
    </div>
    <div v-else-if="state === 'game'" class="game h-screen w-screen relative flex justify-center align-center">
      <div class="orders my-4 mx-4 w-20 flex flex-col gap-5 justify-center">
        <TileOrder
          v-for="order in ordersList"
          :key="order.id"
          :time="order.time"
          :top="order.block.top"
          :left="order.block.left"
          :right="order.block.right"
          :bottom="order.block.bottom"
          :color="order.block.color"
        />
      </div>
      <div class="relative w-min h-min top-1/2 -translate-y-1/2 grid-container">
        <div class="grid-background absolute z-20 pointer-events-none"></div>
        <div class="px-3 py-2">
          <HexGrid @move="handleMove" @use-control="handleUse" :grid="board" :units="unitsList" :mode="mode" />
        </div>
      </div>
      <div class="actions my-8 mx-4 w-min-20 text-center flex flex-col gap-3 justify-center">
        <Tool :selected="mode === 'move'" @pointerdown="mode = 'move'">
          <MovementTools :tools="moveOptions" :selected="mode === 'move'" @update-control="updateControl" />
        </Tool>
        <Tool :selected="mode === 'append'" @pointerdown="mode = 'append'">
          <AppendTools :tools="appendOptions" @update-control="updateControl" />
        </Tool>
        <Tool :selected="mode === 'paint'" @pointerdown="mode = 'paint'">
          <PaintTools :tools="paintOptions" :selected="mode === 'paint'" @update-control="updateControl" />
        </Tool>
        <Tool :selected="mode === 'submit'" @pointerdown="mode = 'submit'">
          <SubmitTool @update-control="updateControl" />
        </Tool>
      </div>
    </div>
    <div v-else-if="state === 'end'" class="game w-full mt-10 text-white px-4 py-2 rounded">
      <div class="text-center">
        <p class="text-3xl mb-2">Game Over!</p>
        <p class="mb-2 text-lg">Your Score: {{ score }}</p>
        <button class="bg-amber-200 text-gray-800 px-4 py-2 rounded my-2 w-full" @pointerdown="emit('start')">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"
import HexGrid from "./HexGrid.vue"
import TileOrder from "./TileOrder.vue"
import Tool from "./Tool.vue"
import MovementTools from "./MovementTools.vue"
import AppendTools from "./AppendTools.vue"
import PaintTools from "./PaintTools.vue"
import SubmitTool from "./SubmitTool.vue"

export default {
  name: "TileGame",
  mixins: [socket],
  components: {
    HexGrid,
    TileOrder,
    Tool,
    MovementTools,
    AppendTools,
    PaintTools,
    SubmitTool,
  },
  data() {
    return {
      state: "menu",
      board: [],
      units: new Map(),
      orders: new Map(),
      mode: "move",
      score: 0,
      tools: [{ type: "move", command: 0 }, { type: "move", command: 2 }, { type: "move", command: 5 }, { type: "append", command: 1 }, { type: "append", command: 3 }, { type: "paint", command: "red" }, { type: "paint", command: "yellow" }],
      control: null
    }
  },
  mounted() {
    this.on("state", this.updateState)
    this.on("update-unit", this.updateUnit)
    this.on("grant-tools", this.updateTools)
    this.on("complete-order", this.completeOrder)
    this.on("new-order", this.newOrder)
    this.on("game-over", this.gameOver)
  },
  methods: {
    updateState({ state, board, units, orders }) {
      this.state = state
      this.board = board
      for (const unit of units) {
        this.units.set(unit.id, unit)
      }
      for (const order of orders) {
        this.orders.set(order.id, order)
      }
    },
    updateTools({ tools }) {
      this.tools = tools
    },
    updateUnit({ unit }) {
      this.units.set(unit.id, unit)
    },
    handleMove(move) {
      if (this.control !== null) {
        return
      }
      this.emit("move", move)
    },
    handleUse(command) {
      if (this.control === null) {
        return
      }
      this.emit(this.mode, { ...command, ...this.control })
    },
    updateControl(control) {
      this.control = control
    },
    newOrder({ order, unit }) {
      if (order) {
        this.orders.set(order.id, order)
      }
      this.units.set(unit.id, unit)
    },
    completeOrder({ order, unit }) {
      this.orders.delete(order)
      this.units.get(unit).drop = true
      setTimeout(() => {
        this.units.delete(unit)
      }, 4000)
    },
    gameOver({ ordersCompleted }) {
      this.state = "end"
      this.score = ordersCompleted
      this.units = new Map()
      this.orders = new Map()
    }
  },
  computed: {
    moveOptions() {
      return this.tools.filter(tool => tool.type === "move").map(tool => tool.command)
    },
    appendOptions() {
      return this.tools.filter(tool => tool.type === "append").map(tool => tool.command)
    },
    paintOptions() {
      return this.tools.filter(tool => tool.type == "paint").map(tool => tool.command)
    },
    unitsList() {
      return Array.from(this.units.values())
    },
    ordersList() {
      return Array.from(this.orders.values())
    }
  }
}
</script>

<style scoped>
.game {
  background-color: #33368e;
  touch-action: none;
}
.grid-container {
  box-shadow: 0px 0px 5px 5px rgba(255, 255, 255, 0.1);
}
.grid-background {
  background-color: #000000;
  width: 100%;
  height: 100%;
  -webkit-mask-image: url("@/assets/images/hexgrid.png");
  mask-image: url("@/assets/images/hexgrid.png");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
