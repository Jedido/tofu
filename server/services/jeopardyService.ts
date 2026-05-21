import { TSocket } from "../utils/tsocket.ts"
import GameService from "./gameService.ts"

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

class JeopardyService extends GameService {
  readonly updatePlayers: string
  readonly updateHost: string
  readonly showCategories: string
  readonly showQuestion: string
  readonly setQuestionState: string
  readonly toggleSubmission: string
  readonly setLocal: string
  readonly buzzer: string

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

    // requests
    this.actions = {
      "jeopardy-start-game": this.startGame.bind(this),
      "jeopardy-set-player": this.joinAsPlayer.bind(this),
      "jeopardy-set-host": this.joinAsHost.bind(this),
      "jeopardy-add-points": this.addPoints.bind(this),
      "jeopardy-display-categories": this.displayCategories.bind(this),
      "jeopardy-display-question": this.displayQuestion.bind(this),
      "jeopardy-buzz": this.broadcastBuzzer.bind(this),
      "jeopardy-next-round": this.nextRound.bind(this),
      "jeopardy-show-submission": this.showSubmission.bind(this),
      "jeopardy-submit": this.submit.bind(this),
      "jeopardy-get-submissions": this.revealSubmissions.bind(this),
      "jeopardy-question-reset": this.resetQuestion.bind(this),
      "jeopardy-clear-buzzer": this.clearBuzzer.bind(this),
      "jeopardy-question-next": this.continueQuestion.bind(this),
      "jeopardy-show-answer": this.showAnswer.bind(this),
    }
    // responses
    this.updatePlayers = "jeopardy-update-players"
    this.updateHost = "jeopardy-update-host"
    this.showCategories = "jeopardy-show-categories"
    this.showQuestion = "jeopardy-show-question"
    this.setQuestionState = "jeopardy-set-question-state"
    this.toggleSubmission = "jeopardy-toggle-submission"
    this.setLocal = "jeopardy-set-local"
    this.buzzer = "jeopardy-buzzer"
    this.host = {
      id: null,
      ign: "None",
    }
    this.players = []
    this.activePlayer = ""
    this.localGame = false
  }

  buildPlayerInfo(socket: TSocket): JeopardyPlayer {
    return {
      ign: socket.ign,
      id: socket.id,
      points: 0,
    }
  }

  join(socket: TSocket) {
    this.joinAsPlayer({}, socket)
    socket.emit(this.setLocal, this.localGame)
  }

  leave(socket: TSocket) {
    const index = this.players.findIndex((player) => player.id === socket.id)
    if (index > -1) {
      this.players.splice(index, 1)
    }
    if (this.host.id == socket.id) {
      this.host = {
        id: null,
        ign: "None",
      }
    }
    this.broadcastPlayerUpdate()
  }

  joinAsPlayer(_: unknown, socket: TSocket) {
    if (!this.players.find((player) => player.id === socket.id)) {
      this.players.push(this.buildPlayerInfo(socket))
      if (this.host.id === socket.id) {
        this.host = {
          id: null,
          ign: "None",
        }
      }
      this.broadcastHostUpdate()
      this.broadcastPlayerUpdate()
    }
  }

  joinAsHost(_: unknown, socket: TSocket) {
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

  startGame(
    { jeopardy, local }: { jeopardy: string; local: boolean },
    socket: TSocket
  ) {
    try {
      // this.game = JSON.parse(fs.readFileSync("./server/assets/jeopardy4.json"))
      this.game = JSON.parse(jeopardy)
      this.round = 0
      this.questionState = 0
      this.categories = this.game.rounds[this.round]
      this.localGame = local
      this.broadcastFn(this.setLocal, this.localGame)
      this.displayCategories(jeopardy, socket)
    } catch (error) {
      socket.emit(
        "log",
        `An error occurred while trying to start the game: ${error}`
      )
    }
  }

  addPoints(
    { id, points }: { id: string; points: number | string },
    socket: TSocket
  ) {
    if (this.host.id !== socket.id) {
      return
    }
    const index = this.players.findIndex((player) => player.id === id)
    this.players[index].points += parseInt(points as string)
    socket.emit(
      "log",
      `${points} points to ${this.players[index].ign} (total: ${this.players[index].points})`
    )
    this.broadcastPlayerUpdate()
  }

  displayCategories(_: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) {
      return
    }
    const categories = this.categories.map((category) => {
      return {
        name: category.name,
        questions: category.questions.map((question) => {
          return {
            points: question.points,
            completed: question.completed || false,
          }
        }),
      }
    })
    this.broadcastFn(this.showCategories, categories)
  }

  nextRound(_: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) {
      return
    }
    if (this.round + 1 < this.game.num_rounds) {
      this.round++
      this.categories = this.game.rounds[this.round]
      this.displayCategories(this.round, socket)
    } else {
      socket.emit("log", "You are already on the final round!")
    }
  }

  displayQuestion(
    { category, points }: { category: string; points: number },
    socket: TSocket
  ) {
    if (this.host.id !== socket.id) {
      return
    }
    const index = this.categories.findIndex((c) => c.name === category)
    const question = this.categories[index].questions.find(
      (question) => question.points === points
    )!
    question.completed = true
    this.activePlayer = ""
    this.questionState = 1
    this.broadcastFn(this.showQuestion, {
      question: question.question,
      answer: question.answer,
      points: question.points,
      type: question.type,
    })
    socket.emit(
      "log",
      `${category} for ${question.points}: ${question.answer} ${question.description ? question.description : ""}`
    )
  }

  showSubmission({ show }: { show: boolean }, socket: TSocket) {
    if (this.host.id !== socket.id) {
      return
    }
    this.broadcastFn(this.toggleSubmission, show)
    if (show) {
      this.submissions = {}
      this.players.forEach((player) => {
        this.submissions[player.id] = []
      })
    }
  }

  submit({ submission }: { submission: string }, socket: TSocket) {
    this.submissions[socket.id].unshift(submission)
  }

  revealSubmissions(_: unknown, socket: TSocket) {
    if (this.host.id !== socket.id) {
      return
    }
    this.players.forEach((player) => {
      const ign = player.ign
      const answers = this.submissions[player.id]
      socket.emit("log", `${ign} submitted: ${answers.join(", ")}`)
    })
  }

  resetQuestion(_: unknown, socket: TSocket) {
    if (this.host.id === socket.id) {
      this.questionState = 1
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  clearBuzzer(_: unknown, socket: TSocket) {
    if (this.host.id === socket.id) {
      this.activePlayer = ""
      this.questionState = 1
      this.broadcastFn(this.setQuestionState, this.questionState)
      this.broadcastFn(this.buzzer, this.activePlayer)
    }
  }

  continueQuestion(_: unknown, socket: TSocket) {
    if (this.host.id === socket.id) {
      this.questionState++
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  showAnswer(_: unknown, socket: TSocket) {
    if (this.host.id === socket.id) {
      this.questionState = 0
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  broadcastBuzzer(_: unknown, socket: TSocket) {
    if (!this.activePlayer) {
      const player = this.players.findIndex((player) => player.id === socket.id)
      if (player > -1) {
        this.players[player].ign = socket.ign
        this.activePlayer = socket.ign
        this.broadcastFn(this.buzzer, this.activePlayer)
      }
    }
  }

  broadcastHostUpdate() {
    this.broadcastFn(this.updateHost, this.host)
  }

  broadcastPlayerUpdate() {
    this.broadcastFn(this.updatePlayers, this.players)
  }
}
JeopardyService.prototype.id = "jeopardy"

export default JeopardyService
