import { TSocket } from "../../utils/tsocket"
import { AddressPuzzleSolution, AlgebraPuzzleSolution, DangerPuzzleSolution, DicePuzzleSolution, GameState, Panel, PanelEnum, PanelInfo, PatternPuzzleSolution, PuzzleEnum, PuzzleSolution, RequestPuzzleSolution, Submission, WantedPuzzleSolution, WirePuzzleSolution, WordPuzzleSolution } from "./types"
import { DangerPuzzle } from "./dangerPuzzle"
import { WirePuzzle } from "./wirePuzzle"
import { RequestPuzzle } from "./requestPuzzle"
import { PatternPuzzle } from "./patternPuzzle"
import { DicePuzzle } from "./dicePuzzle"
import { WantedPuzzle } from "./wantedPuzzle"
import { AlgebraPuzzle } from "./algebraPuzzle"
import { AddressPuzzle } from "./addressPuzzle"
import { WordPuzzle } from "./wordPuzzle"

const GameService = require("../gameService.js")
const { randomItem, shuffle } = require("../../utils/util.js")
const RESULT_DELAY = 3000

class TeamService extends GameService {
  readonly actions = {
    "team-start": this.startGame.bind(this),
    "team-submit": this.submitSolution.bind(this),
    "team-cut": this.cutWire.bind(this),
    "team-next": this.prepareNextLevel.bind(this),
    "team-state": this.syncState.bind(this)
  }
  readonly countdownEvent: string = "team-countdown"
  readonly startEvent: string = "team-start"
  readonly resultEvent: string = "team-result"
  readonly failEvent: string = "team-fail"
  readonly solveEvent: string = "team-solve"
  readonly cutEvent: string = "team-cut-success"
  readonly loseEvent: string = "team-lose"
  readonly winEvent: string = "team-win"
  readonly puzzleTypes = [DangerPuzzle, RequestPuzzle, PatternPuzzle, DicePuzzle, WantedPuzzle, AlgebraPuzzle, WordPuzzle, AddressPuzzle]

  gameState: {
    level: number
    status: GameState
    players: {
      socket: TSocket,
      stacks: Panel[][]
    }[]
  }
  puzzles: Map<number, Map<PanelEnum, PanelInfo>>
  solved: Set<number>
  timer?: NodeJS.Timeout
  timeStart: number
  timeTotal: number

  constructor(roomId: string) {
    super(roomId)
    this.gameState = {
      level: 0,
      status: GameState.Idle,
      players: []
    }
    this.puzzles = new Map()
    this.solved = new Set<number>()
    this.timeStart = 0
    this.timeTotal = 0
  }

  syncState(_: object, socket: TSocket) {
    if (this.gameState.status === GameState.Ongoing) {
      const currentPlayer = this.gameState.players.find(player => player.socket.id === socket.id)
      if (currentPlayer) {
        currentPlayer.socket = socket
        socket.emit(this.startEvent, {
          stacks: currentPlayer.stacks,
          wires: WirePuzzle.wires,
          quota: WirePuzzle.quota,
          time: this.timeTotal,
          timeStart: this.timeStart,
          level: this.gameState.level,
          solved: Array.from(this.solved),
          cut: WirePuzzle.cutWires
        })
      }
    }
  }

  startGame(_: object, socket: TSocket) {
    if (this.getPlayers().length < 2) {
      socket.emit("alert", "You need at least 2 people to start a game!")
      return
    }

    this.gameState = {
      level: 0,
      status: GameState.Idle,
      players: []
    }
    this.gameState.players = this.getPlayers().map((socket: TSocket) => {
      return {
        socket,
        stacks: []
      }
    })
    this.prepareNextLevel({}, socket)
  }

  prepareNextLevel(_: object, socket: TSocket) {
    // check that the game isn't ongoing
    if (this.gameState.status === GameState.Ongoing) {
      this.syncState(_, socket)
    }
    this.solved = new Set<number>()

    this.gameState.level++
    const numStacks: number = Math.min(Math.ceil((this.gameState.level + 1) / 3) + 1, 6)

    // create puzzles
    this.puzzles = new Map<number, Map<PanelEnum, PanelInfo>>
    const numPuzzles: number = Math.ceil(this.gameState.players.length * Math.sqrt(this.gameState.level) * 2)
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
    const timePerPuzzle = 12 * Math.pow(0.9, this.gameState.level)
    this.timeTotal = Math.floor(numPuzzles * timePerPuzzle * 3 / 10) * 10
    this.timer = setTimeout(() => {
      this.broadcastFn(this.loseEvent, { cause: `you ran out of time` })
      this.timer = undefined
      this.gameState.status = GameState.Idle
    }, this.timeTotal * 1000)
    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].stacks = stacks.splice(0, numStacks)
      this.gameState.players[i].socket.emit(this.startEvent, {
        stacks: this.gameState.players[i].stacks,
        wires: WirePuzzle.wires,
        quota: WirePuzzle.quota,
        time: this.timeTotal,
        timeStart: this.timeStart,
        level: this.gameState.level,
        solved: [],
        cut: []
      })
    }
    this.gameState.status = GameState.Ongoing
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
    this.puzzleTypes.forEach(x => x.reset())

    let id = 1
    const numWires = Math.min(Math.floor(this.gameState.level / 4 + 3), 5)
    WirePuzzle.init(numWires)
    const maxWireValue = numPuzzles * (numPuzzles + 1) / 2
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
    const PuzzleType = randomItem(this.puzzleTypes)
    // const PuzzleType = AlgebraPuzzle
    return new PuzzleType(id).panels()
  }

  submitSolution({ type, id, data, stack }: Submission, socket: TSocket): void {
    if (!this.solved.has(id)) {
      setTimeout(() => {
        if (this.solved.has(id)) {
          this.broadcastFn(this.solveEvent, { id })
        } else {
          socket.emit(this.failEvent, { id, stack })
        }
      }, RESULT_DELAY)
      if (this.trySolution(id, type, data)) {
        this.solved.add(id)
      }
    } else {
      socket.emit(this.solveEvent, { id })
    }
  }

  trySolution(id: number, type: PuzzleEnum, data: PuzzleSolution): boolean {
    if (data === undefined) {
      return type === PuzzleEnum.Wire
    }
    try {
      const panelInfo = this.puzzles.get(id)!
      switch (type) {
        case PuzzleEnum.Danger: return DangerPuzzle.solve(data as DangerPuzzleSolution, panelInfo)
        case PuzzleEnum.Request: return RequestPuzzle.solve(data as RequestPuzzleSolution, panelInfo)
        case PuzzleEnum.Pattern: return PatternPuzzle.solve(data as PatternPuzzleSolution, panelInfo)
        case PuzzleEnum.Dice: return DicePuzzle.solve(data as DicePuzzleSolution, panelInfo)
        case PuzzleEnum.Wanted: return WantedPuzzle.solve(data as WantedPuzzleSolution, panelInfo)
        case PuzzleEnum.Algebra: return AlgebraPuzzle.solve(data as AlgebraPuzzleSolution, panelInfo)
        case PuzzleEnum.Address: return AddressPuzzle.solve(data as AddressPuzzleSolution, panelInfo)
        case PuzzleEnum.Word: return WordPuzzle.solve(data as WordPuzzleSolution, panelInfo)
        case PuzzleEnum.Wire: return true
        default:
          console.warn(`Unknown puzzle type: ${type}`)
          return false
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
    if (WirePuzzle.isCut(solution.next)) {
      return
    }
    if (WirePuzzle.cut(solution)) {
      this.broadcastFn(this.cutEvent, { next: solution.next, success: true })
      if (WirePuzzle.completed()) {
        this.broadcastFn(this.winEvent)
        clearTimeout(this.timer)
        this.timer = undefined
        this.gameState.status = GameState.Idle
      }
    } else {
      this.broadcastFn(this.cutEvent, { next: solution.next, success: false })
      this.broadcastFn(this.loseEvent, { cause: `${socket.ign} cut the wrong wire` })
      clearTimeout(this.timer)
      this.timer = undefined
      this.gameState.status = GameState.Idle
    }
  }
}
TeamService.prototype.id = "team"

module.exports = TeamService