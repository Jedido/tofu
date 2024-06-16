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
      "disconnect": this.removePlayer.bind(this)
    }
    // responses
    this.updatePlayers = "jeopardy-update-players"
    this.updateHost = "jeopardy-update-host"
    this.showCategories = "jeopardy-show-categories"
    this.showQuestion = "jeopardy-show-question"
    this.showNextClue = "jeopardy-next-clue"
    this.hideQuestion = "jeopardy-hide-question"
    // TODO: Allow a selection
    this.host = {
      id: null,
      ign: "None"
    }
    this.players = []
  }

  buildPlayerInfo(socket) {
    return {
      ign: socket.ign,
      id: socket.id,
      points: 0
    }
  }

  dropOut(socket) {
    if (this.host.id === socket.id) {
      this.broadcastFn("log", "The host has disconnected! The game must be restarted.")
    }
    this.removePlayer(socket)
  }

  removePlayer(socket) {
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

  startGame({ categories }, socket) {
    this.categories = JSON.parse(categories)
    // save the file
    this.displayCategories(categories, socket)
  }

  addPoints({ id, points }, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    let index = this.players.findIndex(player => player.id === id)
    this.players[index].points += points
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

  displayQuestion({ category, points }, socket) {
    if (this.host.id !== socket.id) {
      return
    }
    let index = this.categories.findIndex(c => c.name === category)
    let question = this.categories[index].questions.find(question => question.points === points)
    question.completed = true
    this.broadcastFn(this.showQuestion, {
      question: question.question,
      points: question.points,
      type: question.type
    })
    socket.emit("log", `${category} for ${question.points}: ${question.answer}`)
  }

  broadcastBuzzer(_, socket) {
    let player = this.players.findIndex(player => player.id === socket.id)
    if (player > -1) {
      this.players[player].ign = socket.ign
      this.broadcastFn("log", `${socket.ign} buzzed in`)
      this.broadcastFn(this.hideQuestion, true)
    } else if (this.host.id === socket.id) {
      socket.emit("log", `Now accepting responses`)
      this.broadcastFn(this.hideQuestion, false)
      this.broadcastFn(this.showNextClue)
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
