import { DangerPuzzleSolution, Panel, PanelEnum, PanelInfo, PuzzleEnum, PuzzleSolution, Submission } from "./types"
import { DangerPuzzle } from "./dangerPuzzle"

const GameService = require("../gameService.js")
const { shuffle } = require("../../utils/util.js")

// mock socket for compiling
interface Socket {
  ign: string
  emit: Function
}

class TeamService extends GameService {
  readonly actions = {
    "team-start": this.startGame.bind(this),
    "team-submit": this.submitSolution.bind(this)
  }
  readonly countdownEvent: string = "team-countdown"
  readonly stacksEvent: string = "team-stacks"
  readonly resultEvent: string = "team-result"
  readonly solveEvent: string = "team-solve"
  readonly strikeEvent: string = "team-strike"

  gameState: {
    strikes: number
    level: number
    status: object
    players: {
      socket: Socket
      stacks: Panel[][]
    }[]
  }
  puzzles: Map<number, Map<PanelEnum, PanelInfo>>
  solved: Set<number>

  constructor(roomId: string) {
    super(roomId)
    this.gameState = {
      strikes: 0,
      level: 0,
      status: {},
      players: []
    }
    this.puzzles = new Map()
    this.solved = new Set<number>()
  }

  startGame(_: object, socket: Socket) {
    if (this.getPlayers().length < 2) {
      socket.emit("alert", "You need at least 2 people to start a game!")
      // return
    }

    this.solved = new Set<number>()
    this.gameState = {
      strikes: 3,
      level: 1,
      status: {},
      players: []
    }
    const numStacks: number = Math.ceil(this.gameState.level / 3)
    this.gameState.players = this.getPlayers().map((socket: Socket) => {
      return {
        socket,
        stacks: Array.from({ length: numStacks }, () => [])
      }
    })

    // create puzzles
    this.puzzles = new Map<number, Map<PanelEnum, PanelInfo>>
    const numPuzzles: number = Math.ceil(this.gameState.players.length * Math.sqrt(this.gameState.level) * 3)
    const panelsByPuzzle: Panel[][] = []
    let id = 10 + Math.ceil(Math.random() * 10)
    for (let i = 0; i < numPuzzles; i++) {
      panelsByPuzzle.push(this.generatePuzzle(id))
      id += Math.ceil(Math.random() * 4)
    }
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
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].socket.emit(this.stacksEvent, stacks.splice(0, numStacks))
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
      totalWeights += 1 / (stack.length + 0.01)
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

  generatePuzzle(id: number) {
    return new DangerPuzzle(id).panels()
  }

  submitSolution({ type, id, data }: Submission, socket: Socket) {
    if (this.trySolution(id, type, data)) {
      if (!this.solved.has(id)) {
        this.broadcastFn(this.solveEvent, { id })
        this.solved.add(id)
      }
      socket.emit(this.resultEvent, { id, result: 'success' })
    } else {
      this.gameState.strikes -= 1
      setTimeout(() => {
        this.broadcastFn(this.strikeEvent, { id })
        this.broadcastFn("log", `${socket.ign} made an error!`)
      }, 3000)
      socket.emit(this.resultEvent, { id, result: 'failure' })
    }
  }

  trySolution(id: number, type: PuzzleEnum, data: PuzzleSolution): boolean {
    if (data === undefined && this.solved.has(id)) {
      return true
    }
    try {
      switch (type) {
        case PuzzleEnum.Danger: return DangerPuzzle.solve(data as DangerPuzzleSolution, this.puzzles.get(id)!)
      }
    } catch (e: unknown) {
      if (typeof e === "string") {
        console.log(e.toUpperCase())
      } else if (e instanceof Error) {
        console.log(e.message)
      }
      return false
    }
    return false
  }
  
}
TeamService.prototype.id = "team"

module.exports = TeamService