import {
  JeopardyServiceBase,
  type StartGameData,
  type AddPointsData,
  type DisplayQuestionData,
  type ShowSubmissionData,
  type SubmitData,
  type TSocket,
} from "./jeopardyServiceBase.ts"

interface JeopardyPlayer {
  ign: string
  id: string
  points: number
}

interface JeopardyQuestion {
  points: number
  question: string
  answer: string
  type?: string
  description?: string
  completed?: boolean
}

interface JeopardyCategory {
  name: string
  questions: JeopardyQuestion[]
}

interface JeopardyGame {
  num_rounds: number
  rounds: JeopardyCategory[][]
}

interface HostInfo {
  id: string | null
  ign: string
}

export default class extends JeopardyServiceBase {
  host: HostInfo
  players: JeopardyPlayer[]
  activePlayer: string
  localGame: boolean
  game!: JeopardyGame
  round!: number
  questionState!: number
  categories!: JeopardyCategory[]
  submissions!: Record<string, string[]>

  constructor(roomId: string) {
    super(roomId)
    this.host = { id: null, ign: "None" }
    this.players = []
    this.activePlayer = ""
    this.localGame = false
  }

  override join(socket: TSocket) {
    this.setPlayerAction(null, socket)
    this.sendSetLocal(this.localGame, socket)
  }

  override leave(socket: TSocket) {
    const index = this.players.findIndex((player) => player.id === socket.id)
    if (index > -1) {
      this.players.splice(index, 1)
    }
    if (this.host.id === socket.id) {
      this.host = { id: null, ign: "None" }
    }
    this.broadcastPlayerUpdate()
  }

  startGameAction({ jeopardy, local }: StartGameData, socket: TSocket) {
    try {
      this.game = JSON.parse(jeopardy)
      this.round = 0
      this.questionState = 0
      this.categories = this.game.rounds[this.round]
      this.localGame = local
      this.sendSetLocal(this.localGame)
      this.displayCategoriesAction(null, socket)
    } catch (error) {
      socket.emit(
        "log",
        `An error occurred while trying to start the game: ${error}`
      )
    }
  }

  setPlayerAction(_data: unknown, socket: TSocket) {
    if (!this.players.find((player) => player.id === socket.id)) {
      this.players.push(this.buildPlayerInfo(socket))
      if (this.host.id === socket.id) {
        this.host = { id: null, ign: "None" }
      }
      this.broadcastHostUpdate()
      this.broadcastPlayerUpdate()
    }
  }

  setHostAction(_data: unknown, socket: TSocket) {
    if (!this.host.id) {
      this.host = this.buildPlayerInfo(socket)
      const playerIndex = this.players.findIndex(
        (player) => player.id === socket.id
      )
      if (playerIndex >= 0) {
        this.players.splice(playerIndex, 1)
        this.broadcastPlayerUpdate()
      }
      this.broadcastHostUpdate()
    }
  }

  addPointsAction({ id, points }: AddPointsData, socket: TSocket) {
    if (this.host.id !== socket.id) return
    const index = this.players.findIndex((player) => player.id === id)
    this.players[index].points += parseInt(points as string)
    socket.emit(
      "log",
      `${points} points to ${this.players[index].ign} (total: ${this.players[index].points})`
    )
    this.broadcastPlayerUpdate()
  }

  displayCategoriesAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    const categories = this.categories.map((category) => ({
      name: category.name,
      questions: category.questions.map((question) => ({
        points: question.points,
        completed: question.completed || false,
      })),
    }))
    this.sendShowCategories(categories)
  }

  displayQuestionAction(
    { category, points }: DisplayQuestionData,
    socket: TSocket
  ) {
    if (this.host.id !== socket.id) return
    const index = this.categories.findIndex((c) => c.name === category)
    const question = this.categories[index].questions.find(
      (q) => q.points === points
    )!
    question.completed = true
    this.activePlayer = ""
    this.questionState = 1
    this.sendShowQuestion({
      question: question.question,
      answer: question.answer,
      points: question.points,
      type: question.type,
    })
    socket.emit(
      "log",
      `${category} for ${question.points}: ${question.answer} ${question.description ?? ""}`
    )
  }

  buzzAction(_data: unknown, socket: TSocket) {
    if (!this.activePlayer) {
      const player = this.players.findIndex((p) => p.id === socket.id)
      if (player > -1) {
        this.players[player].ign = socket.ign
        this.activePlayer = socket.ign
        this.sendBuzzer(this.activePlayer)
      }
    }
  }

  nextRoundAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    if (this.round + 1 < this.game.num_rounds) {
      this.round++
      this.categories = this.game.rounds[this.round]
      this.displayCategoriesAction(null, socket)
    } else {
      socket.emit("log", "You are already on the final round!")
    }
  }

  showSubmissionAction({ show }: ShowSubmissionData, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.sendToggleSubmission(show)
    if (show) {
      this.submissions = {}
      this.players.forEach((player) => {
        this.submissions[player.id] = []
      })
    }
  }

  submitAction({ submission }: SubmitData, socket: TSocket) {
    this.submissions[socket.id].unshift(submission)
  }

  getSubmissionsAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.players.forEach((player) => {
      const answers = this.submissions[player.id]
      socket.emit("log", `${player.ign} submitted: ${answers.join(", ")}`)
    })
  }

  questionResetAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.questionState = 1
    this.sendSetQuestionState(this.questionState)
  }

  clearBuzzerAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.activePlayer = ""
    this.questionState = 1
    this.sendSetQuestionState(this.questionState)
    this.sendBuzzer(this.activePlayer)
  }

  questionNextAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.questionState++
    this.sendSetQuestionState(this.questionState)
  }

  showAnswerAction(_data: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) return
    this.questionState = 0
    this.sendSetQuestionState(this.questionState)
  }

  private buildPlayerInfo(socket: TSocket): JeopardyPlayer {
    return { ign: socket.ign, id: socket.id, points: 0 }
  }

  private broadcastHostUpdate() {
    this.sendUpdateHost(this.host)
  }

  private broadcastPlayerUpdate() {
    this.sendUpdatePlayers(this.players)
  }
}
