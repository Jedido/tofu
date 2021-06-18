<template>
  <div class="flex flex-col items-center text-gray-700 min-w-max">
    <h2 class="text-3xl mb-4 mt-2">Anagram</h2>
    <div
      :class="[
        {
          hidden: status != 'menu',
        },
        'px-8 py-4 bg-white',
      ]"
    >
      <p class="font-semibold text-lg">Settings</p>
      <form class="grid grid-cols-6 gap-2 min-w-full select-none">
        <p class="col-span-2 ml-auto">Game Mode</p>
        <select v-model="settings.gameMode" class="border bg-amber-50">
          <option value="coop">co-op</option>
          <option value="sync">sync</option>
          <option value="rush">rush</option>
        </select>
        <p class="col-span-3">{{ gameModeDescription }}</p>
        <p class="col-span-2 ml-auto">Timer Type</p>
        <select
          v-model="settings.timerType"
          class="border disabled:bg-gray-300 bg-amber-50"
          :disabled="settings.cipherTime === '31'"
        >
          <option value="normal">normal</option>
          <option value="adaptive">adaptive</option>
          <option value="faster">faster</option>
        </select>
        <p class="col-span-3">{{ timerTypeDescription }}</p>
        <input
          v-model="settings.showAnswer"
          type="checkbox"
          id="showAnswer"
          class="col-span-3 ml-auto h-full"
        />
        <label class="col-span-3" for="showAnswer"
          >Reveal answer when it is guessed</label
        >
        <input
          v-model="settings.oneshot"
          type="checkbox"
          id="oneshot"
          class="col-span-3 ml-auto h-full"
        />
        <label class="col-span-3" for="oneshot">One guess per cipher</label>
        <input
          v-model="settings.strikes"
          type="range"
          id="strikes"
          min="0"
          max="11"
          class="slider col-span-2 col-start-2"
        />
        <label for="strikes" class="col-span-3"
          >{{
            settings.strikes === "11" ? "unlimited" : settings.strikes
          }}
          strikes</label
        >
        <input
          v-model="settings.cipherTime"
          type="range"
          id="cipherTime"
          min="3"
          max="31"
          class="slider col-span-2 col-start-2"
        />
        <label for="ciphers" class="col-span-3"
          >Cipher Time:
          {{ settings.cipherTime === "31" ? "unlimited" : settings.cipherTime }}
          seconds</label
        >
        <input
          v-model="settings.ciphers"
          type="range"
          id="ciphers"
          min="0"
          max="110"
          class="slider col-span-2 col-start-2"
          step="10"
        />
        <label for="ciphers" class="col-span-3"
          >Total Ciphers:
          {{
            settings.ciphers === "110" ? "unlimited" : settings.ciphers
          }}</label
        >

        <p class="col-span-6 mt-3">Win Condition</p>
        <input
          v-model="settings.scoreLimit"
          type="range"
          id="score"
          min="3"
          max="100"
          class="slider col-span-2 col-start-2"
        />
        <label for="score" class="col-span-3"
          >Score: {{ settings.scoreLimit }} correct</label
        >
        <input
          v-model="settings.timeLimit"
          type="range"
          id="timeLimit"
          min="10"
          max="300"
          step="10"
          class="slider col-span-2 col-start-2"
        />
        <label for="timeLimit" class="col-span-3"
          >Time Limit: {{ settings.timeLimit }} seconds</label
        >
        <button
          class="
            mt-4
            py-4
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
            col-span-6
          "
          @click.prevent="startGame()"
        >
          Start
        </button>
      </form>
    </div>
    <div
      :class="[
        'flex flex-col items-center w-5/6 p-6 bg-white rounded gap-6 min-w-max',
        { hidden: status !== 'ongoing' },
      ]"
    >
      <TimerBar
        ref="gameTimer"
        @timer="inputDisabled = true"
        class="text-center w-full h-2 rounded overflow-hidden"
      />
      <div :class="cipherColor">
        <p v-if="cipherAnimation" :class="['text-5xl mt-8 mb-3', shake]">
          {{ cipher }}
        </p>
        <p v-else class="text-5xl mt-8 mb-3 shake">
          {{ cipher }}
        </p>
      </div>
      <TimerBar
        ref="wordTimer"
        v-if="settings.cipherTime > 0 || countdown !== 0"
        @timer="handleWordTimeout()"
        class="text-center w-3/4 mb-6 h-6"
      />
      <input
        class="
          px-4
          text-lg
          w-1/2
          text-center
          rounded
          border-2 border-gray-300
          focus:outline-none
          disabled:bg-gray-200
        "
        type="text"
        v-model="answer"
        @keyup="submitAnswer"
        :disabled="inputDisabled"
        focus
      />
      <div class="flex flex-col w-full gap-2 py-2">
        <PlayerCard
          v-for="[player, state] in Object.entries(players)"
          :key="player"
          v-bind="{
            max: settings.scoreLimit,
            name: player,
            score: state.score,
            strikes: state.strikes,
            maxStrikes: settings.strikes,
          }"
        />
      </div>
    </div>
    <EndCard
      :class="{
        hidden: status != 'end',
      }"
      :stats="endGameStats"
      @play-again="startGame"
    />
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"
import TimerBar from "./TimerBar.vue"
import PlayerCard from "./PlayerCard.vue"
import EndCard from "./EndCard.vue"

export default {
  name: "AnagramGame",
  components: {
    TimerBar,
    PlayerCard,
    EndCard,
  },
  mixins: [socket],
  data() {
    return {
      status: "menu",
      settings: {
        cipherTime: "10",
        ciphers: "110",
        gameMode: "coop",
        oneshot: false,
        scoreLimit: "100",
        showAnswer: true,
        strikes: "11",
        timeLimit: "60",
        timerType: "faster",
      },
      cipher: "",
      cipherColor: "",
      answer: "",
      players: {},
      inputDisabled: false,
      cipherAnimation: true,
      shake: "",
      gameMode: false,
      countdown: 3,
      revealed: false,
      endGameStats: {
        ciphers: [],
        results: [],
      },
    }
  },
  mounted() {
    this.on("result", this.handleResult)
    this.on("start", this.handleStart)
    this.on("update-player", this.updatePlayer)
    this.on("cipher", this.handleCipher)
    this.on("end", this.endGame)
  },
  unmounted() {
    console.log("shutting down...")
  },
  methods: {
    startGame() {
      const maxZero = (value, max) => {
        return value === max ? "0" : value
      }
      const settings = {
        cipherTime: maxZero(this.settings.cipherTime, "31"),
        ciphers: maxZero(this.settings.ciphers, "110"),
        gameMode: "coop",
        oneshot: false,
        scoreLimit: this.settings.scoreLimit,
        showAnswer: true,
        strikes: maxZero(this.settings.strikes, "11"),
        timeLimit: this.settings.timeLimit,
        timerType: "faster",
      }
      this.emit("init", settings)
    },
    handleStart({ settings, players }) {
      console.log(settings)
      this.settings = settings
      this.status = "ongoing"
      this.inputDisabled = false
      this.cipher = ""
      this.shake = ""
      setTimeout(() => {
        this.$refs.gameTimer.set(settings.timeLimit * 1000)
      }, 3000)
      this.$refs.gameTimer.reset()
      this.players = players.reduce((acc, cur) => {
        acc[cur] = {
          score: "0",
          strikes: "0",
        }
        return acc
      }, {})
      this.countdown = 4
      this.handleWordTimeout()
    },
    submitAnswer(e) {
      if (e.keyCode === 13) {
        this.emit("submit", this.answer)
        this.answer = ""
      }
    },
    handleResult(answer, failure = false) {
      if (!answer) {
        if (!this.shake) {
          this.shake = "shake"
        } else {
          this.cipherAnimation = !this.cipherAnimation
        }
        if (this.settings.oneshot) {
          this.cipherColor = "error"
          this.inputDisabled = true
        }
      } else {
        this.cipher = answer
        this.cipherColor = failure ? "text-error" : "text-emerald-400"
        this.$refs.wordTimer.reset()
      }
    },
    updatePlayer(player, score, strikes) {
      this.players[player].score = `${score}`
      this.players[player].strikes = strikes
    },
    endGame(data) {
      this.status = "end"
      console.log(data)
      this.endGameStats = data
    },
    handleCipher(cipher, time = 10000) {
      this.cipherColor = ""
      this.countdown = 0
      this.inputDisabled = false
      this.$refs.wordTimer.set(time)
      this.cipher = cipher
    },
    handleWordTimeout() {
      if (this.countdown > 0) {
        this.countdown--
        this.cipher = this.countdown
        if (this.countdown > 0) {
          this.$refs.wordTimer.set(1000)
        }
      } else {
        // this.inputDisabled = true
      }
      // this.status = "lose"
    },
  },
  computed: {
    gameModeDescription() {
      switch (this.settings.gameMode) {
        case "coop":
          return "Work together to solve each cipher"
        case "sync":
          return "Compete to decipher the phrase first"
        case "rush":
          return "Solve the ciphers as fast as you can"
      }
      return "???"
    },
    timerTypeDescription() {
      switch (this.settings.timerType) {
        case "normal":
          return "Timer never changes"
        case "adaptive":
          return "Timer changes based on your accuracy"
        case "faster":
          return "Timer gets shorter with each phrase"
      }
      return "???"
    },
  },
}
</script>

<style scoped>
.slider {
  margin-top: 8px;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #f3f4f6;
  border: 1px solid #9ca3af;
  outline: none;
  transition: background-color 0.2s;
}

.slider:hover {
  background: #e5e7eb;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

.shake {
  animation: shake 0.3s;
}
@keyframes shake {
  0% {
    color: #ef4444;
    transform: translate(2px, 0px);
  }
  20% {
    transform: translate(-4px, 0px);
  }
  40% {
    transform: translate(3px, 0px);
  }
  60% {
    transform: translate(-2px, 0px);
  }
  80% {
    transform: translate(1px, 0px);
  }
  100% {
    color: inherit;
  }
}
</style>
