<template>
  <div class="flex flex-col items-center text-gray-700">
    <h2 class="text-3xl mb-4">Anagram</h2>
    <div
      class="flex flex-col items-center w-5/6 p-6 bg-white rounded gap-6"
      v-if="gameMode"
    >
      <p v-if="cipherAnimation" :class="['text-5xl mt-8 mb-3', shake]">
        {{ cipher }}
      </p>
      <p v-else class="text-5xl mt-8 mb-3 shake">
        {{ cipher }}
      </p>
      <div class="text-center w-full mb-6">
        <div class="bg-gray-200 h-6">
          <div
            :class="['bg-emerald-500 h-full w-full', timerStatus]"
            :style="{
              transition: `width ${time}ms linear, background-color ${
                time - 500
              }ms ease`,
            }"
          ></div>
        </div>
      </div>
      <input
        class="
          px-4
          text-lg
          w-3/4
          text-center
          rounded
          border-2 border-gray-300
          focus:outline-none
        "
        type="text"
        v-model="answer"
        @keyup="submitAnswer"
        :disabled="inputDisabled"
        focus
      />
      <div class="flex justify-around w-full">
        <div
          v-for="[player, score] in Object.entries(players)"
          :key="player"
          class="flex flex-col items-center bg-amber-200 rounded px-5 py-2"
        >
          <p>{{ player }}</p>
          <p class="text-lg font-semibold">{{ score }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <button class="p-3 bg-emerald-400 rounded" @click="startGame()">
        Start
      </button>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"

const RESET_MILLIS = 500

export default {
  name: "AnagramGame",
  mixins: [socket],
  data() {
    return {
      cipher: "",
      time: 0,
      status: "",
      timer: null,
      timerStatus: "",
      answer: "",
      players: { jed: 5, leo: 3 },
      submitting: false,
      inputDisabled: false,
      cipherAnimation: true,
      shake: "",
      gameMode: false,
      score: 0,
    }
  },
  mounted() {
    this.on("result", this.handleResult)
    this.on("state", this.updateState)
    this.on("update-score", this.updateScore)
    this.on("cipher", this.handleCipher)
    this.on("end", this.endGame)
  },
  unmounted() {
    console.log("shutting down...")
  },
  methods: {
    startGame() {
      this.emit("init", { coop: true })
      this.handleCipher("asdfasasdfasdfdf", 5000)
      this.status = "ongoing"
    },
    submitAnswer(e) {
      if (e.keyCode === 13) {
        this.emit("submit", this.answer)
        this.answer = ""
      }
    },
    handleResult(success) {
      if (!success) {
        if (!this.shake) {
          this.shake = "shake"
        } else {
          this.cipherAnimation = !this.cipherAnimation
        }
      } else {
        this.resetTime()
      }
    },
    updateState(data) {
      this.cipher = data.cipher
      this.gameMode = data.gameMode
      // roundNum: this.roundNum,
      // scores: this.scores,
      this.score = data.score
    },
    updateScore() {
      // console.log("update score")
    },
    endGame(data) {
      this.gameMode = false
      this.score = data.score
      console.log(data)
    },
    handleCipher(cipher, time = 10000) {
      this.resetTime()
      setTimeout(() => {
        this.timerStatus = "drain"
        this.time = time - RESET_MILLIS
      }, RESET_MILLIS)
      this.cipher = cipher
      this.timer = setTimeout(this.handleTimeout, time)
    },
    handleTimeout() {
      // this.inputDisabled = true
      // this.status = "lose"
    },
    resetTime() {
      this.time = RESET_MILLIS
      this.timerStatus = ""
      clearTimeout(this.timer)
    },
  },
}
</script>

<style scoped>
.drain {
  width: 0px;
  background-color: #ef4444;
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
