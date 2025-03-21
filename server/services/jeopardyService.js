const GameService = require("./gameService.js")
const fs = require("fs")

class JeopardyService extends GameService {
  constructor(roomId) {
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
      "jeopardy-show-answer": this.showAnswer.bind(this)
    }
    // responses
    this.updatePlayers = "jeopardy-update-players"
    this.updateHost = "jeopardy-update-host"
    this.showCategories = "jeopardy-show-categories"
    this.showQuestion = "jeopardy-show-question"
    this.setQuestionState = "jeopardy-set-question-state"
    this.toggleSubmission = "jeopardy-toggle-submission"
    this.buzzer = "jeopardy-buzzer"
    // TODO: Allow a selection
    this.host = {
      id: null,
      ign: "None"
    }
    this.players = []
    this.activePlayer = ""
  }

  buildPlayerInfo(socket) {
    return {
      ign: socket.ign,
      id: socket.id,
      points: 0
    }
  }

  leave(socket) {
    super.disconnect(socket)
    let index = this.players.findIndex(player => player.id === socket.id)
    if (index > -1) {
      this.players.splice(index, 1)
    }
    this.broadcastPlayerUpdate()
  }

  joinAsPlayer(_, socket) {
    if (!this.players.find(player => player.id === socket.id)) {
      this.players.push(this.buildPlayerInfo(socket))
      if (this.host.id === socket.id) {
        this.host = {
          id: null,
          ign: "None"
        }
      }
      this.broadcastHostUpdate(socket)
      this.broadcastPlayerUpdate()
    }
  }

  joinAsHost(_, socket) {
    if (!this.host.id) {
      this.host = this.buildPlayerInfo(socket)
      this.removePlayer(socket)
      this.broadcastHostUpdate(socket)
    }
  }

  startGame({ jeopardy }, socket) {
    try {
      this.game = JSON.parse(fs.readFileSync("./server/assets/jeopardy4.json"))
    //   this.game = JSON.parse(jeopardy)
      this.round = 0
      this.questionState = 0
      this.categories = this.game.rounds[this.round]
      this.displayCategories(jeopardy, socket)
    } catch (error) {
      socket.emit("log", `An error occurred while trying to start the game: ${error}`)
    }
  }

  addPoints({ id, points }, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    let index = this.players.findIndex(player => player.id === id)
    this.players[index].points += parseInt(points)
    socket.emit("log", `${points} points to ${this.players[index].ign} (total: ${this.players[index].points})`)
    this.broadcastPlayerUpdate()
  }

  displayCategories(_, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    let categories = this.categories.map(category => {
      return {
        name: category.name,
        questions: category.questions.map(question => {
          return {
            points: question.points,
            completed: question.completed || false
          }
        })
      }
    })
    this.broadcastFn(this.showCategories, categories)
  }

  nextRound(_, socket) {
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

  displayQuestion({ category, points }, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    let index = this.categories.findIndex(c => c.name === category)
    let question = this.categories[index].questions.find(question => question.points === points)
    question.completed = true
    this.activePlayer = ""
    this.questionState = 1
    this.broadcastFn(this.showQuestion, {
      question: question.question,
      answer: question.answer,
      points: question.points,
      type: question.type
    })
    socket.emit("log", `${category} for ${question.points}: ${question.answer} ${question.description}`)
  }

  showSubmission({ show }, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    this.broadcastFn(this.toggleSubmission, show)
    if (show) {
      this.submissions = {}
      this.players.forEach(player => {
        this.submissions[player.id] = []
      })
    }
  }

  submit({ submission }, socket) {
    this.submissions[socket.id].unshift(submission)
  }

  revealSubmissions(_, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    this.players.forEach(player => {
      const ign = player.ign
      const answers = this.submissions[player.id]
      socket.emit("log", `${ign} submitted: ${answers.join(", ")}`)
    })
  }

  resetQuestion(_, socket) {
    if (this.host.id === socket.id) {
      this.questionState = 1
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  clearBuzzer(_, socket) {
    if (this.host.id === socket.id) {
      this.activePlayer = ""
      this.questionState = 1
      this.broadcastBuzzer(this.setQuestionState, this.questionState)
      this.broadcastFn(this.buzzer, this.activePlayer)
    }
  }

  continueQuestion(_, socket) {
    if (this.host.id === socket.id) {
      this.questionState++
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  showAnswer(_, socket) {
    if (this.host.id === socket.id) {
      this.questionState = 0
      this.broadcastFn(this.setQuestionState, this.questionState)
    }
  }

  broadcastBuzzer(_, socket) {
    if (!this.activePlayer) {
      let player = this.players.findIndex(player => player.id === socket.id)
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

module.exports = JeopardyService
