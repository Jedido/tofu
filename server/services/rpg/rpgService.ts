import { JsonSchema, RPGActionResult, RPGEnemyAction, RPGEntity, RPGInit, RPGAttack, RPGPercent } from "../../assets/schemas"
import { AIClient } from "../../clients/aiClient"
import { TSocket } from "../../utils/tsocket"

const GameService = require("../gameService.js")

interface RPGPlayer {
  socket: TSocket
  id: string,
  name: string
  maxHp: number
  hp: number
  attacks: RPGAttack[]
  class: string
}

interface Action {
  message: string
}

const attackPrompt = `\nEvaluate the attack based on the following criteria: 
1. How easy it would be to execute the attack. For example, a punch is much easier to perform than ten punches.
2. Assess the effectiveness against the enemy that it is being used on. For example, arrows are be ineffective against ghostly enemies.
3. Reward creativity, but do not allow players to use skills outside their character's abilities. For example, a knight should not be able to use magic unless they have a specific item that allows it.
4. Take their items into consideration. If a player tries to swing a sword but doesn't have one, it should not work.
Using these two criteria, you will give a percentage p bewtween 0 and 100, which represents the likelihood of the attack succeeding. The simpler and more realistic an attack is, the lower the difficulty should be. For example:
If the player says, "I throw a punch", this is a relatively simple and realistic attack. The percentage may be set to 85, having an 85% chance of success.
If the player says, "I cast instant death magic and obliterate the goblins", this is an extremely unrealistic and unfair attack. Percentage should be 0 in this case.`

class RPGService extends GameService {
  readonly actions = {
    "rpg-start": this.startGame.bind(this),
    "rpg-attempt-action": this.attemptAction.bind(this),
    "rpg-next": this.next.bind(this),
    "rpg-select-item": this.selectItem(this)
  }
  readonly loadingEvent: string = "rpg-loading"
  readonly initGameEvent: string = "rpg-init-game"
  readonly startEncounterEvent: string = "rpg-encounter"
  readonly requestActionEvent: string = "rpg-request-action"
  readonly actionAttemptEvent: string = "rpg-attempt-action"
  readonly actionResultEvent: string = "rpg-action-result"
  readonly actionRollEvent: string = "rpg-action-roll"
  readonly itemSelectEvent: string = "rpg-item-selected"

  rpgPlayers: RPGPlayer[]
  premise?: string
  enemy?: {
    name: string
    description: string
    hp: number
    maxHp: number
  }
  aiClient: AIClient
  currentAttack?: {
    p: number
    name: string
    action: string
  }
  currentActor: number
  awaitingNext: boolean
  record: string[]
  items: string[]

  constructor(roomId: string) {
    super(roomId)
    this.rpgPlayers = []
    this.aiClient = new AIClient(`rpg-ai-client-${roomId}`)
    this.currentActor = 0
    this.awaitingNext = true
    this.record = []
    this.items = []
  }

  contextPrompt(): string {
    const context = `You are a game master in charge of managing a turn-based text RPG, where the players head out on a quest. There are ${this.rpgPlayers.length} players in this game:
    ${this.rpgPlayers.map(player => `${player.name} (${player.hp}/${player.maxHp} HP)`).join("\n")}.`
    const setting = this.premise ? `\n\nThis is the setting: ${this.premise}` : ""
    const enemy = this.enemy ? `\n\nThe party is fighting this enemy with ${this.enemy.hp}/${this.enemy.maxHp} HP: ${this.enemy.name}, ${this.enemy.description}` : ""
    const battle = this.enemy ? `\n\nThe battle so far: ${this.record.join("\n")}` : ""
    const instructions = `\n\n`
    return context + instructions + setting + enemy + battle
  }

  async startGame() {
    this.rpgPlayers = this.getPlayers().map((player: TSocket) => {
      return {
        socket: player.socket,
        id: player.id,
        name: player.ign,
        maxHp: 10,
        hp: 10,
        items: [],
        class: ""
      }
    })
    this.record = []
    this.enemy = undefined
    this.currentActor = 0
    const intro = `\nTo begin, we need to create a NEW scenario. Come up with:
    * title: a title for their journey, based on the premise.
    * premise: a premise for the party's quest. This can be realistic or unrealistic, as long as it is coherent.
    * classes: ${this.rpgPlayers.length + 1} job classes for the players to choose from to begin their journey.
    `
    const res: RPGInit = await this.prompt<RPGInit>(intro, "RPGInit")
    this.broadcastFn(this.initGameEvent, { 
      setting: res,
      players: this.playerData(),
      classes: res.classes
    })
    this.items = res.classes
    this.awaitingNext = true
  }

  async next() {
    if (!this.awaitingNext) {
      return
    }
    this.awaitingNext = false
    if (!this.enemy) {
      await this.nextEncounter()
    } else if (this.enemy.hp === 0) {
      this.broadcastFn("log", "You have won!")
    } else {
      if (this.currentAttack) {
        await this.performAction()
      } else {
        await this.nextTurn()
      }
    }
    this.awaitingNext = true
  }

  async nextTurn() {
    if (this.currentActor < this.rpgPlayers.length) {
      this.rpgPlayers[this.currentActor].socket.emit(this.requestActionEvent)
    } else {
      await this.enemyAction()
    }
  }

  async nextEncounter() {
    const requestEnemy = "The party encounters an enemy. Please come up with an enemy, its hp, a description of the enemy, and a list of attacks that it can use"
    const res: RPGEntity = await this.prompt<RPGEntity>(requestEnemy, "RPGEntity")
    this.currentActor = 0
    this.enemy = {
      name: res.name,
      description: res.description,
      hp: res.hp,
      maxHp: res.hp
    }
    this.broadcastFn(this.startEncounterEvent, this.enemy)
  }

  async attemptAction(action: Action, socket: TSocket) {
    if (this.currentActor >= this.rpgPlayers.length || this.rpgPlayers[this.currentActor].id !== socket.id) {
      socket.emit("alert", "It is not your turn!")
      return
    }
    const tryAction = `${socket.ign} says they want to perform the following action, which is surrounded in <player> tags: <player>${action.message}</player>.
    \n${attackPrompt}`
    const res: RPGPercent = await this.prompt<RPGPercent>(tryAction, "RPGPercent")
    this.currentAttack = {
      p: 20 - Math.floor(res.percentage / 5),
      name: socket.ign,
      action: action.message
    }
    this.broadcastFn(this.actionAttemptEvent, this.currentAttack)
  }

  async enemyAction() {
    if (this.enemy) {
      const performAction = `It is now the enemy's turn. Please provide:
      * attack: an action that they will attempt, and the likelihood that it will succeed
      * percentage: the likelihood for the attack to succeed \n${attackPrompt}`
      const res = await this.prompt<RPGEnemyAction>(performAction, "RPGEnemyAction")
      this.currentAttack = {
        p: 20 - Math.floor(res.percentage / 5),
        name: this.enemy.name,
        action: res.action
      }
      this.broadcastFn(this.actionAttemptEvent, this.currentAttack)
    }
  }

  async performAction() {
    if (this.currentAttack) {
      const roll = Math.floor(Math.random() * 20 + 1)
      const status = this.currentAttack.p < roll ? "succeeded" : "failed"
      const record = `${this.currentAttack.name} ${status} to performed an action: ${this.currentAttack.action}`
      const performAction = `${this.currentAttack.name} ${status} to performed an action: ${this.currentAttack.action}. Please provide:
      * description: what happened after the action ${status}
      * result: a list of characters damaged by the action, if any. For each character, provide their name and the amount of damage taken.
      Remember, this action ${status}.`
      this.broadcastFn(this.actionRollEvent, {
        roll
      })
      const res = await this.prompt<RPGActionResult>(performAction, "RPGActionResult")
      this.record.push(record)
      this.record.push(res.description)
      for (const result of res.result) {
        const playerTarget = this.rpgPlayers.find(player => player.name === result.name)
        if (playerTarget) {
          playerTarget.hp -= result.damage
          if (playerTarget.hp <= 0) {
            playerTarget.hp = 0
          }
        } else if (this.enemy && this.enemy.name === result.name) {
          this.enemy.hp -= result.damage
          if (this.enemy.hp < 0) {
            this.enemy.hp = 0
          }
        }
      }
      this.broadcastFn(this.actionResultEvent, {
        result: res,
        players: this.playerData(),
        enemy: this.enemy
      })
      this.currentAttack = undefined
      this.currentActor = (this.currentActor + 1) % (this.rpgPlayers.length + 1)
    }
  }

  async prompt<Schema>(message: string, type: string): Promise<Schema> {
    const context = this.contextPrompt()
    this.broadcastFn(this.loadingEvent)
    return this.aiClient.fetch({
      messages: [{
        role: "system",
        content: context
      }, {
        role: "user",
        content: message
      }],
      schema: new JsonSchema(type)
    })
  }

  playerData() {
    return this.rpgPlayers.map(player => {
      return {
        name: player.name,
        hp: player.hp,
        maxHp: player.maxHp,
        attacks: player.attacks,
        class: player.class
      }
    })
  }
}
RPGService.prototype.id = "rpg"

module.exports = RPGService