import { DangerPuzzleSolution, Panel, PanelEnum, PanelInfo, PuzzleEnum, PuzzleSolution, Submission, WirePuzzleSolution } from "./types"
import { DangerPuzzle } from "./dangerPuzzle"
import { TSocket } from "../../utils/tsocket"
import { WirePuzzle } from "./wirePuzzle"

const GameService = require("../gameService.js")
const { shuffle } = require("../../utils/util.js")
const RESULT_DELAY = 3000

class TeamService extends GameService {
  readonly actions = {
    "team-start": this.startGame.bind(this),
    "team-submit": this.submitSolution.bind(this),
    "team-cut": this.cutWire.bind(this),
    "team-next": this.prepareNextLevel.bind(this)
  }
  readonly countdownEvent: string = "team-countdown"
  readonly startEvent: string = "team-start"
  readonly resultEvent: string = "team-result"
  readonly solveEvent: string = "team-solve"
  readonly cutEvent: string = "team-cut-success"
  readonly loseEvent: string = "team-lose"
  readonly winEvent: string = "team-win"

  gameState: {
    level: number
    status: object
    players: {
      socket: TSocket
    }[]
  }
  puzzles: Map<number, Map<PanelEnum, PanelInfo>>
  solved: Set<number>
  timer?: NodeJS.Timeout

  constructor(roomId: string) {
    super(roomId)
    this.gameState = {
      level: 0,
      status: {},
      players: []
    }
    this.puzzles = new Map()
    this.solved = new Set<number>()
  }

  startGame(_: object, socket: TSocket) {
    if (this.getPlayers().length < 2) {
      socket.emit("alert", "You need at least 2 people to start a game!")
      return
    }

    this.gameState = {
      level: 0,
      status: {},
      players: []
    }
    this.gameState.players = this.getPlayers().map((socket: TSocket) => {
      return {
        socket
      }
    })
    this.prepareNextLevel()
  }

  prepareNextLevel() {
    this.gameState.level++
    this.solved = new Set<number>()
    const numStacks: number = Math.ceil(this.gameState.level / 3)

    // create puzzles
    this.puzzles = new Map<number, Map<PanelEnum, PanelInfo>>
    const numPuzzles: number = Math.ceil(this.gameState.players.length * Math.sqrt(this.gameState.level) * 3)
    const panelsByPuzzle: Panel[][] = this.generatePuzzles(numPuzzles)
    shuffle(panelsByPuzzle)

    // register puzzles
    const totalStacks = numStacks * this.gameState.players.length
    const stacks: Panel[][] = Array.from({ length: totalStacks }, () => [])
    for (const puzzlePanels of panelsByPuzzle) {
      const id = puzzlePanels[0].id
      this.puzzles.set(id, new Map<PanelEnum, PanelInfo>())
      for (const panel of puzzlePanels) {
        this.puzzles.get(id)!.set(panel.panel, panel.state)
        this.addToRandomStack(stacks, panel)
      }
    }

    // sort stacks by id to ensure solvability
    stacks.forEach(stack => {
      stack.sort((a, b) => a.id - b.id)
    })

    // assign stacks to players
    this.timeStart = Date.now()
    const timePerPuzzle = 10 * Math.pow(0.95, this.gameState.level)
    const time = numPuzzles * timePerPuzzle * 3
    this.timer = setTimeout(() => {
      this.broadcastFn(this.loseEvent, { cause: `you ran out of time` })
    }, time * 1000)
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].socket.emit(this.startEvent, {
        stacks: stacks.splice(0, numStacks),
        wires: WirePuzzle.wires,
        quota: WirePuzzle.quota,
        time,
        timeStart: this.timeStart,
        level: this.gameState.level
      })
    }
  }

  // add to a random stack based on a weighted random
  addToRandomStack(stacks: Panel[][], panel: Panel): void {
    const validStacks: Panel[][] = stacks.filter(stack => !stack.find(p => p.id === panel.id))
    if (validStacks.length === 0) {
      console.error("Failed to setup the game! Something has gone terribly wrong!")
      return
    }
    let totalWeights = 0
    const stacksBySize: Map<number, Panel[]> = new Map(validStacks.map(stack => {
      totalWeights += 1 / (stack.length * stack.length + 0.01)
      return [totalWeights, stack]
    }))
    const r = Math.random() * totalWeights
    for (const [weight, stack] of stacksBySize) {
      if (r < weight) {
        stack.push(panel)
        break
      }
    }
  }

  generatePuzzles(numPuzzles: number): Panel[][] {
    const panelsByPuzzle: Panel[][] = []
    let id = 10 + Math.ceil(Math.random() * 10)
    const numWires = Math.floor(Math.random() * 3) + 3
    WirePuzzle.init(numWires)
    const maxWireValue = numWires * (numWires + 1) / 2
    const wireValues = Array.from({ length: numWires }, () => Math.random() * maxWireValue)
    const added = new Set<number>()
    let cumulative = 0
    for (let i = 0; i < numPuzzles; i++) {
      panelsByPuzzle.push(this.generatePuzzle(id))
      id += Math.ceil(Math.random() * 5)
      cumulative += i
      for (let j = 0; j < wireValues.length; j++) {
        if (wireValues[j] < cumulative && !added.has(j)) {
          added.add(j)
          panelsByPuzzle.push(WirePuzzle.getPanel(j, id))
          id += Math.ceil(Math.random() * 5)
        }
      }
    }
    for (let j = 0; j < wireValues.length; j++) {
      if (!added.has(j)) {
        panelsByPuzzle.push(WirePuzzle.getPanel(j, id))
        id += Math.ceil(Math.random() * 5)
      }
    }
    return panelsByPuzzle
  }

  generatePuzzle(id: number): Panel[] {
    return new DangerPuzzle(id).panels()
  }

  submitSolution({ type, id, data, stack }: Submission, socket: TSocket): void {
    let result = { stack, id, result: 'failure' }
    setTimeout(() => {
      result.result = this.solved.has(id) ? 'success' : 'failure'
      socket.emit(this.resultEvent, result)
    }, RESULT_DELAY)
    if (!this.solved.has(id) && this.trySolution(id, type, data)) {
      this.broadcastFn(this.solveEvent, { id })
      this.solved.add(id)
    }
  }

  trySolution(id: number, type: PuzzleEnum, data: PuzzleSolution): boolean {
    if (data === undefined) {
      return type === PuzzleEnum.Wire
    }
    try {
      switch (type) {
        case PuzzleEnum.Danger: return DangerPuzzle.solve(data as DangerPuzzleSolution, this.puzzles.get(id)!)
        case PuzzleEnum.Wire: return true
      }
    } catch (e: unknown) {
      if (typeof e === "string") {
        console.log(e.toUpperCase())
      } else if (e instanceof Error) {
        console.log(e.message)
      }
      return false
    }
  }
  
  cutWire(solution: WirePuzzleSolution, socket: TSocket): void {
    if (WirePuzzle.cut(solution)) {
      this.broadcastFn(this.cutEvent, { next: solution.next, success: true })
      if (WirePuzzle.order.length === 0) {
        this.broadcastFn(this.winEvent)
        clearTimeout(this.timer)
      } 
    } else {
      this.broadcastFn(this.cutEvent, { next: solution.next, success: false })
      this.broadcastFn(this.loseEvent, { cause: `${socket.ign} cut the wrong wire` })
      clearTimeout(this.timer)
    }
  }
}
TeamService.prototype.id = "team"

module.exports = TeamService