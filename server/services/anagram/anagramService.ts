import fs from "fs"
import {
  AnagramServiceBase,
  type SettingsData,
  type SubmitData,
  type TSocket,
} from "./anagramServiceBase.ts"

const MS_TO_S = 1000
const NEXT_WORD_DELAY = 400

function shuffle(phrase: string): string {
  let res = ""
  phrase.split(" ").forEach((word) => {
    const arr = Array.from(word)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[j]
      arr[j] = arr[i]
      arr[i] = temp
    }
    res += arr.join("")
  })
  return res
}

interface AnagramPlayer {
  ign: string
  score: number
  round: number
  time: number
  submissions: string[]
  strikes: number
}

export default class extends AnagramServiceBase {
  settings!: SettingsData
  players!: Record<string, AnagramPlayer>
  numPlayers = 0
  numAnswered = 0
  showingAnswer = false
  wordList: string[]
  ciphers: [string, string][] = []
  wordTimerId: ReturnType<typeof setTimeout> | number = -1
  gameTimerId!: ReturnType<typeof setTimeout>

  constructor(roomId: string) {
    super(roomId)
    const file = fs.readFileSync("./server/assets/words.txt", "utf8")
    this.wordList = file.trim().split("\n")
  }

  private initPlayers(): Record<string, AnagramPlayer> {
    return this.getPlayers().reduce(
      (acc: Record<string, AnagramPlayer>, cur: TSocket) => {
        acc[cur.id] = {
          ign: cur.ign,
          score: 0,
          round: 0,
          time: parseInt(this.settings.cipherTime as string),
          submissions: [],
          strikes: 0,
        }
        return acc
      },
      {}
    )
  }

  private generateCipher(): [string, string] {
    const word =
      this.wordList[Math.floor(Math.random() * this.wordList.length)].trim()
    const cipher = shuffle(word)
    this.ciphers.push([word, cipher])
    return [word, cipher]
  }

  private currentWord(ign?: string): string {
    return this.settings.gameMode === "coop"
      ? this.ciphers[this.players.coop.round][0]
      : this.ciphers[this.players[ign!].round][0]
  }

  private nextCipher(ign?: string) {
    if (
      this.players.coop.round ===
      parseInt(this.settings.ciphers as unknown as string)
    ) {
      this.endGame()
    }
    let newWord: [string, string]
    if (this.settings.timerType === "faster") {
      this.players.coop.time -= 0.5
      this.players.coop.time = Math.max(this.players.coop.time, 3)
    }
    if (
      this.settings.gameMode !== "coop" &&
      ign &&
      this.players[ign].round < this.ciphers.length
    ) {
      newWord = this.ciphers[this.players[ign].round]
    } else {
      newWord = this.generateCipher()
    }
    this.numAnswered = 0
    if (this.settings.showAnswer) {
      setTimeout(() => {
        this.showingAnswer = false
        this.sendCipher({
          scrambled: newWord[1],
          time: this.players.coop.time * MS_TO_S,
        })
        this.wordTimerId = setTimeout(
          this.wordTimeout.bind(this),
          this.players.coop.time * MS_TO_S
        )
      }, NEXT_WORD_DELAY)
    } else {
      this.sendCipher({
        scrambled: newWord[1],
        time: this.players.coop.time * MS_TO_S,
      })
      this.wordTimerId = setTimeout(
        this.wordTimeout.bind(this),
        this.players.coop.time * MS_TO_S
      )
    }
  }

  private endGame() {
    clearTimeout(this.gameTimerId)
    clearTimeout(this.wordTimerId)
    const results = Object.entries(this.players).reduce(
      (
        res: Record<
          string,
          { ign: string; score: number; submissions: string[] }
        >,
        [userId, data]
      ) => {
        res[userId] = {
          ign: data.ign,
          score: data.score,
          submissions: data.submissions,
        }
        return res
      },
      {}
    )
    this.sendEnd({ results, ciphers: this.ciphers })
  }

  private wordTimeout() {
    this.showingAnswer = true
    const current = this.currentWord()
    this.players.coop.submissions.push("?")
    this.players.coop.round++
    this.players.coop.strikes++
    if (this.settings.timerType === "adaptive") {
      this.players.coop.time += 0.5
    }
    this.sendUpdatePlayer({
      playerId: "coop",
      score: this.players.coop.score,
      strikes: this.players.coop.strikes,
    })
    if (this.settings.showAnswer) {
      this.sendResult({ answer: current, timeout: true })
      setTimeout(this.nextCipher.bind(this), NEXT_WORD_DELAY)
    } else {
      this.nextCipher()
    }
  }

  initAction(settings: SettingsData, _sender: TSocket) {
    /*
     * Game Mods (0 is infinite):
     * gameMode: string (coop) - coop (share score), sync (first to get it), rush (at your own pace)
     * showAnswer: boolean (true) - skip showing the answer after it's guessed
     * oneshot: boolean (false) - only 1 guess per cipher (per person)
     * strikes: num (0) - total number of misses before losing
     * ciphers: num (0) - total number of ciphers
     * cipherTime: num (10) - base cipher time
     * timerType: string (normal) - normal, adaptive (+/-), faster (only -)
     * scoreLimit: num (0) - win game after score is reached (first to reach score wins)
     * timeLimit: num (60) - ends game after time is elapsed (highest score wins)
     * working settings: gamemode = coop, showAnswer = true/false, cipherTime = num != 0, timerType = normal, timeLimit = num != 0
     */
    this.settings = settings
    this.players = this.initPlayers()
    const players = Object.keys(this.players).map((id) => ({
      id,
      ign: this.players[id].ign,
    }))
    this.numPlayers = players.length
    this.numAnswered = 0
    if (settings.gameMode === "coop") {
      players.unshift({ id: "coop", ign: "co-op" })
      this.players.coop = {
        ign: "co-op",
        score: 0,
        round: 0,
        time: parseInt(settings.cipherTime as string),
        submissions: [],
        strikes: 0,
      }
    }
    this.showingAnswer = false
    this.sendStart({ players, settings })
    this.wordTimerId = -1
    this.gameTimerId = setTimeout(
      this.endGame.bind(this),
      MS_TO_S * (parseInt(settings.timeLimit as string) + 3)
    )
    this.ciphers = []
    this.generateCipher()
    const newWord = this.ciphers[0]
    setTimeout(() => {
      this.wordTimerId = setTimeout(
        this.wordTimeout.bind(this),
        (settings.cipherTime as number) * MS_TO_S
      )
      this.sendCipher({
        scrambled: newWord[1],
        time: (settings.cipherTime as number) * MS_TO_S,
      })
    }, 3000)
  }

  submitAction(message: SubmitData, socket: TSocket) {
    if (!message || this.showingAnswer) return
    const player = this.players[socket.id]
    const curRound =
      this.settings.gameMode === "coop" ? this.players.coop.round : player.round
    if (this.settings.oneshot && player.submissions.length >= curRound) return
    while (player.submissions.length < curRound) {
      player.submissions.push("?")
    }
    player.submissions[curRound] = message
    if (this.settings.gameMode === "coop") {
      this.numAnswered++
      if (message === this.currentWord()) {
        clearTimeout(this.wordTimerId)
        this.players.coop.submissions.push(message)
        this.players.coop.score++
        this.players.coop.round++
        this.sendUpdatePlayer({
          playerId: "coop",
          score: this.players.coop.score,
          strikes: this.players.coop.strikes,
        })
        this.players[socket.id].score++
        this.sendUpdatePlayer({
          playerId: socket.id,
          score: this.players[socket.id].score,
          strikes: this.players[socket.id].strikes,
        })
        if (this.settings.showAnswer) {
          this.showingAnswer = true
          this.sendResult({ answer: message, timeout: false })
        }
        if (this.settings.timerType === "adaptive") {
          this.players.coop.time -= 0.5
        }
        this.nextCipher()
      } else {
        this.players.coop.strikes++
        this.sendResult({ answer: null, timeout: false }, socket)
        this.sendUpdatePlayer({
          playerId: "coop",
          score: this.players.coop.score,
          strikes: this.players.coop.strikes,
        })
        if (
          Number(this.settings.strikes) > 0 &&
          this.players.coop.strikes >= Number(this.settings.strikes)
        ) {
          this.endGame()
        }
      }
    } else {
      if (message === this.currentWord()) {
        this.sendResult({ answer: null, timeout: false }, socket)
        this.wordTimeout()
      } else {
        this.sendResult({ answer: null, timeout: false }, socket)
      }
    }
  }
}
