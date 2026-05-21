import {
  TeamServiceBase,
  type SubmissionData,
  type WireCutData,
  type TSocket,
} from "./teamServiceBase.ts"
import {
  GameState,
  PanelEnum,
  PuzzleEnum,
  type Panel,
  type PanelInfo,
  type PuzzleSolution,
  type DangerPuzzleSolution,
  type RequestPuzzleSolution,
  type PatternPuzzleSolution,
  type DicePuzzleSolution,
  type WantedPuzzleSolution,
  type AlgebraPuzzleSolution,
  type AddressPuzzleSolution,
  type WordPuzzleSolution,
} from "./types"
import { DangerPuzzle } from "./dangerPuzzle"
import { WirePuzzle } from "./wirePuzzle"
import { RequestPuzzle } from "./requestPuzzle"
import { PatternPuzzle } from "./patternPuzzle"
import { DicePuzzle } from "./dicePuzzle"
import { WantedPuzzle } from "./wantedPuzzle"
import { AlgebraPuzzle } from "./algebraPuzzle"
import { AddressPuzzle } from "./addressPuzzle"
import { WordPuzzle } from "./wordPuzzle"
import { randomItem, shuffle } from "../../utils/util.ts"

const RESULT_DELAY = 3000

export default class extends TeamServiceBase {
  readonly puzzleTypes = [
    DangerPuzzle,
    RequestPuzzle,
    PatternPuzzle,
    DicePuzzle,
    WantedPuzzle,
    AlgebraPuzzle,
    WordPuzzle,
    AddressPuzzle,
  ]

  gameState: {
    level: number
    status: GameState
    players: { socket: TSocket; stacks: Panel[][] }[]
  }
  puzzles: Map<number, Map<PanelEnum, PanelInfo>>
  solved: Set<number>
  timer?: ReturnType<typeof setTimeout>
  timeStart: number
  timeTotal: number

  constructor(roomId: string) {
    super(roomId)
    this.gameState = { level: 0, status: GameState.Idle, players: [] }
    this.puzzles = new Map()
    this.solved = new Set()
    this.timeStart = 0
    this.timeTotal = 0
  }

  startAction(_data: unknown, socket: TSocket) {
    if (this.getPlayers().length < 2) {
      socket.emit("alert", "You need at least 2 people to start a game!")
      return
    }
    this.gameState = { level: 0, status: GameState.Idle, players: [] }
    this.gameState.players = this.getPlayers().map((s: TSocket) => ({
      socket: s,
      stacks: [],
    }))
    this.nextAction(null, socket)
  }

  submitAction({ type, id, data, stack }: SubmissionData, socket: TSocket) {
    if (!this.solved.has(id)) {
      setTimeout(() => {
        if (this.solved.has(id)) {
          this.sendSolve({ id })
        } else {
          this.sendFail({ id, stack }, socket)
        }
      }, RESULT_DELAY)
      if (this.trySolution(id, type as PuzzleEnum, data as PuzzleSolution)) {
        this.solved.add(id)
      }
    } else {
      this.sendSolve({ id }, socket)
    }
  }

  cutAction({ next }: WireCutData, socket: TSocket) {
    if (WirePuzzle.isCut(next)) return
    if (WirePuzzle.cut({ next })) {
      this.sendCutSuccess({ next, success: true })
      if (WirePuzzle.completed()) {
        this.sendWin(null)
        clearTimeout(this.timer)
        this.timer = undefined
        this.gameState.status = GameState.Idle
      }
    } else {
      this.sendCutSuccess({ next, success: false })
      this.sendLose({ cause: `${socket.ign} cut the wrong wire` })
      clearTimeout(this.timer)
      this.timer = undefined
      this.gameState.status = GameState.Idle
    }
  }

  nextAction(_data: unknown, socket: TSocket) {
    if (this.gameState.status === GameState.Ongoing) {
      this.stateAction(null, socket)
    }
    this.solved = new Set()
    this.gameState.level++
    const numStacks = Math.min(Math.ceil((this.gameState.level + 1) / 3) + 1, 6)

    this.puzzles = new Map()
    const numPuzzles = Math.ceil(
      this.gameState.players.length * Math.sqrt(this.gameState.level) * 2
    )
    const panelsByPuzzle = this.generatePuzzles(numPuzzles)
    shuffle(panelsByPuzzle)

    const totalStacks = numStacks * this.gameState.players.length
    const stacks: Panel[][] = Array.from({ length: totalStacks }, () => [])
    for (const puzzlePanels of panelsByPuzzle) {
      const id = puzzlePanels[0].id
      this.puzzles.set(id, new Map())
      for (const panel of puzzlePanels) {
        this.puzzles.get(id)!.set(panel.panel, panel.state)
        this.addToRandomStack(stacks, panel)
      }
    }

    stacks.forEach((stack) => stack.sort((a, b) => a.id - b.id))

    this.timeStart = Date.now()
    const timePerPuzzle = 12 * Math.pow(0.9, this.gameState.level)
    this.timeTotal = Math.floor((numPuzzles * timePerPuzzle * 3) / 10) * 10
    this.timer = setTimeout(() => {
      this.sendLose({ cause: `you ran out of time` })
      this.timer = undefined
      this.gameState.status = GameState.Idle
    }, this.timeTotal * 1000)

    for (let i = 0; i < this.gameState.players.length; i++) {
      this.gameState.players[i].stacks = stacks.splice(0, numStacks)
      this.sendStart(
        {
          stacks: this.gameState.players[i].stacks,
          wires: WirePuzzle.wires,
          quota: WirePuzzle.quota,
          time: this.timeTotal,
          timeStart: this.timeStart,
          level: this.gameState.level,
          solved: [],
          cut: [],
        },
        this.gameState.players[i].socket
      )
    }
    this.gameState.status = GameState.Ongoing
  }

  stateAction(_data: unknown, socket: TSocket) {
    if (this.gameState.status === GameState.Ongoing) {
      const currentPlayer = this.gameState.players.find(
        (player) => player.socket.id === socket.id
      )
      if (currentPlayer) {
        currentPlayer.socket = socket
        this.sendStart(
          {
            stacks: currentPlayer.stacks,
            wires: WirePuzzle.wires,
            quota: WirePuzzle.quota,
            time: this.timeTotal,
            timeStart: this.timeStart,
            level: this.gameState.level,
            solved: Array.from(this.solved),
            cut: WirePuzzle.cutWires,
          },
          socket
        )
      }
    }
  }

  private addToRandomStack(stacks: Panel[][], panel: Panel): void {
    const validStacks = stacks.filter(
      (stack) => !stack.find((p) => p.id === panel.id)
    )
    if (validStacks.length === 0) {
      console.error(
        "Failed to setup the game! Something has gone terribly wrong!"
      )
      return
    }
    let totalWeights = 0
    const stacksBySize: Map<number, Panel[]> = new Map(
      validStacks.map((stack) => {
        totalWeights += 1 / (stack.length * stack.length + 0.01)
        return [totalWeights, stack]
      })
    )
    const r = Math.random() * totalWeights
    for (const [weight, stack] of stacksBySize) {
      if (r < weight) {
        stack.push(panel)
        break
      }
    }
  }

  private generatePuzzles(numPuzzles: number): Panel[][] {
    const panelsByPuzzle: Panel[][] = []
    this.puzzleTypes.forEach((x) => x.reset())

    let id = 1
    const numWires = Math.min(Math.floor(this.gameState.level / 4 + 3), 5)
    WirePuzzle.init(numWires)
    const maxWireValue = (numPuzzles * (numPuzzles + 1)) / 2
    const wireValues = Array.from(
      { length: numWires },
      () => Math.random() * maxWireValue
    )
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

  private generatePuzzle(id: number): Panel[] {
    const PuzzleType = randomItem(this.puzzleTypes)
    return new PuzzleType(id).panels()
  }

  private trySolution(
    id: number,
    type: PuzzleEnum,
    data: PuzzleSolution
  ): boolean {
    if (data === undefined) return type === PuzzleEnum.Wire
    try {
      const panelInfo = this.puzzles.get(id)!
      switch (type) {
        case PuzzleEnum.Danger:
          return DangerPuzzle.solve(data as DangerPuzzleSolution, panelInfo)
        case PuzzleEnum.Request:
          return RequestPuzzle.solve(data as RequestPuzzleSolution, panelInfo)
        case PuzzleEnum.Pattern:
          return PatternPuzzle.solve(data as PatternPuzzleSolution, panelInfo)
        case PuzzleEnum.Dice:
          return DicePuzzle.solve(data as DicePuzzleSolution, panelInfo)
        case PuzzleEnum.Wanted:
          return WantedPuzzle.solve(data as WantedPuzzleSolution, panelInfo)
        case PuzzleEnum.Algebra:
          return AlgebraPuzzle.solve(data as AlgebraPuzzleSolution, panelInfo)
        case PuzzleEnum.Address:
          return AddressPuzzle.solve(data as AddressPuzzleSolution, panelInfo)
        case PuzzleEnum.Word:
          return WordPuzzle.solve(data as WordPuzzleSolution, panelInfo)
        case PuzzleEnum.Wire:
          return true
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
}
