<template>
  <div id="jeopardy" class="select-none text-gray-700">
    <div class="grid grid-cols-6 gap-3" v-if="status === 'menu'">
      <button
        class="
          mt-2
          py-3
          focus:outline-none
          text-amber-50
          bg-emerald-600
          hover:bg-emerald-500
          active:bg-emerald-800
          rounded
          col-span-3
        "
        @click.prevent="emit('set-host')"
      >
        Host
      </button>
      <button
        class="
          mt-2
          py-3
          focus:outline-none
          text-amber-50
          bg-emerald-600
          hover:bg-emerald-500
          active:bg-emerald-800
          rounded
          col-span-3
        "
        @click.prevent="emit('set-player')"
      >
        Contestant
      </button>
      <div class="col-span-3">
        Host
        <div>
          {{ host }}
        </div>
      </div>
      <div class="col-span-3">
        Contestants
        <ul>
          <li v-for="player in players">
            {{ player.ign }}
          </li>
        </ul>
      </div>
      <form v-if="hosting" class="col-span-6 flex flex-col">
        <p class="mb-2">Questions</p>
        <textarea type="text" class="font-mono text-sm" rows="24" cols="30" v-model="questionsJson">
        </textarea>
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
          "
          @click.prevent="emit('start-game', { jeopardy: questionsJson })"
        >
          Start Game
        </button>
      </form>
    </div>
    <div v-else>
      <div v-if="status === 'categories'" class="grid gap-2 grid-flow-col h-100" :style="[jeopardyGridStyle]">
        <template v-for="category in categories">
          <h2 class="font-bold font-mono text-center my-auto leading-tight overflow-auto">{{ category.name }}</h2>
          <button
            v-for="question in category.questions"
            class="
              py-4
              focus:outline-none
              text-amber-50
              hover:bg-emerald-500
              active:bg-emerald-800
              rounded
            "
            :class="[question.completed ? 'bg-gray-300' : 'bg-emerald-600']"
            @click.prevent="openQuestion(category.name, question.points)"
          >
            {{ question.points }}
          </button>
        </template>
      </div>
      <div
        v-else-if="status === 'question'"
        class="text-2xl bg-white mx-6 h-100 p-3"
      >
        <JeopardyQuestion :question="question" :level="level" :preload="hosting" :buzzer="buzzer" />
      </div>
      <div v-if="hosting" class="w-full grid grid-cols-6 gap-2 mt-2">
        <template v-if="status === 'categories'">
          <button
            class="
              py-4
              col-span-6
              focus:outline-none
              text-amber-50
              bg-emerald-600
              hover:bg-emerald-500
              active:bg-emerald-800
              rounded
            "
            @click.prevent="emit('next-round')"
          >
            Next Round
          </button>

        </template>
        <template v-else>
          <button
            class="
              col-span-2
              py-4
              focus:outline-none
              text-amber-50
              bg-emerald-600
              hover:bg-emerald-500
              active:bg-emerald-800
              rounded
            "
            @click.prevent="emit('display-categories')"
          >
            Categories
          </button>
          <button
            class="
              col-span-2
              py-4
              focus:outline-none
              text-amber-50
              bg-emerald-600
              hover:bg-emerald-500
              active:bg-emerald-800
              rounded
            "
            @click.prevent="buzz()"
          >
            Next
          </button>
          <button
            class="
              col-span-2
              py-4
              focus:outline-none
              text-amber-50
              bg-emerald-600
              hover:bg-emerald-500
              active:bg-emerald-800
              rounded
            "
            @click.prevent="buzz()"
          >
            Show Answer
          </button>
        </template>
        <button
          class="
            col-span-3
            py-4
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
          "
          @click.prevent="emit('show-submission', { show: !showSubmission })"
        >
          {{ showSubmission ? "Stop Submissions" : "Accept Submissions" }}
        </button>
        <button
          class="
            col-span-3
            py-4
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
          "
          @click.prevent="emit('get-submissions')"
        >
          Show Submissions
        </button>
      </div>
      <div v-else>
        <div v-if="showSubmission" class="my-2 flex flex-col">
          <p class="mx-auto text-lg">Submission</p>
          <input
            type="text" 
            class="
              mx-auto
              py-4
              px-4
              text-lg
              w-1/2
              text-center
              rounded
              border-2 border-gray-300
              focus:outline-none
              disabled:bg-gray-200
            "
            v-model="submission" 
            @keyup="submitAnswer"
          />
          <p v-if="lastSubmission" class="mx-auto">Your Response: {{ lastSubmission }}</p>
        </div>
        <button
          v-else
          class="
            py-4
            mt-2
            w-full
            focus:outline-none
            text-amber-50
            bg-emerald-600
            hover:bg-emerald-500
            active:bg-emerald-800
            rounded
          "
          @click.prevent="buzz()"
        >
          Buzz
        </button>
      </div>
      <h3 class="mt-3 text-xl text-center">Scores</h3>
      <div v-if="hosting" class="flex justify-center gap-2 my-1">
        <p>Points:</p>
        <input
          type="text"
          v-model="points"
          class="
            text-center
            border-2 border-gray-300
            focus:outline-none
          "
          id="score-input"
        />
      </div>
      <div class="flex justify-around">
        <div v-for="player in players" class="text-center">
          <div class="text-lg">{{ player.ign }}: {{ player.points }}</div>
          <form v-if="hosting" class="flex flex-col justify-between gap-2">
            <button
              class="
                p-2
                text-amber-50
                bg-emerald-600
                hover:bg-emerald-500
                active:bg-emerald-800
                rounded
              "
              @click.prevent="addPoints(player, points)"
            >
              Add
            </button>
            <button
              class="
                p-2
                bg-amber-300
                hover:bg-amber-200
                active:bg-amber-400
                rounded
              "
              @click.prevent="addPoints(player, -points)"
            >
              Remove
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { debounce } from "lodash";
import socket from "../../mixins/socket.js"
import JeopardyQuestion from "./JeopardyQuestion.vue"

export default {
  name: "JeopardyGame",
  mixins: [socket],
  components: {
    JeopardyQuestion
  },
  data() {
    return {
      status: "menu",
      host: "None",
      hosting: false,
      buzzer: "",
      players: [],
      categories: [],
      question: {},
      level: 1,
      points: 0,
      questionsJson: "",
      showSubmission: false,
      submission: "",
      lastSubmission: ""
    }
  },
  mounted() {
    this.on("update-players", (players) => {
      this.players = players
    })
    this.on("update-host", (host) => {
      this.host = host.ign
      this.hosting = host.id === this.$store.state.id
    })
    this.on("show-categories", (categories) => {
      this.status = "categories"
      this.categories = categories
      this.buzzer = ""
    })
    this.on("show-question", (question) => {
      this.level = 1
      this.status = "question"
      this.question = question
      this.points = question.points
    })
    this.emit("set-player")
    this.on("next-clue", () => {
      this.level++
    })
    this.on("buzzer", (player) => {
      this.buzzer = player
      if (!this.buzzer && this.question.type === "zoom" || this.question.type === "blur") {
        this.level--
      }
    })
    this.on("toggle-submission", (show) => {
      this.showSubmission = show
      this.lastSubmission = ""
      this.submission = ""
    })
  },
  methods: {
    addPoints(player, points) {
      if (this.hosting) {
        this.emit("add-points", { id: player.id, points})
      }
    },
    openQuestion(category, points) {
      if (this.hosting) {
        this.emit("display-question", { category, points })
      }
    },
    buzz: debounce(function() {
      this.emit("buzz")
    }, 100),
    submitAnswer(e) {
      if (e.keyCode === 13) {
        this.emit("submit", { submission: this.submission })
        this.lastSubmission = this.submission
        this.submission = ""
      }
    }
  },
  computed: {
    jeopardyGridStyle() {
      return {
        "grid-template-columns": `repeat(${this.categories.length},minmax(0,1fr))`,
        "grid-template-rows": `repeat(${this.categories[0].questions.length + 1},minmax(0,1fr))`
      }
    } 
  }
}
</script>

<style scoped>
#score-input {
  width: 50px;
}

@media (max-width: 768px) {
  .py-4 {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}
</style>