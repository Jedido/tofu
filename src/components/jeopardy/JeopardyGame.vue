<template>
  <div id="jeopardy" class="select-none text-gray-700">
    <h2 class="text-2xl text-center mb-2">Jeopardy!</h2>
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
      <button
        v-if="hosting"
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
        @click.prevent="emit('display-categories')"
      >
        Start Game
      </button>
    </div>
    <div v-else>
      <div v-if="status === 'categories'" class="grid grid-cols-5 grid-rows-6 gap-2 grid-flow-col">
        <template v-for="category in categories">
          <h2 class="text-center mt-auto leading-tight">{{ category.name }}</h2>
          <button
            v-for="question in category.questions"
            class="
              py-4
              focus:outline-none
              text-amber-50
              bg-emerald-600
              hover:bg-emerald-500
              active:bg-emerald-800
              disabled:bg-gray-300
              rounded
            "
            @click.prevent="openQuestion(category.name, question.points)"
            :disabled="question.completed"
          >
            {{ question.points }}
          </button>
        </template>
      </div>
      <div
        v-else-if="status === 'question'"
        class="text-2xl bg-white mx-6 h-80 p-3"
      >
        <JeopardyQuestion :question="question" :level="level" :preload="hosting" :class="{ 'hidden': questionHidden }"/>
      </div>
      <button
        v-if="hosting"
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
        @click.prevent="emit('display-categories')"
      >
        Categories
      </button>
      <button
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
      <h3 class="mt-3 text-xl text-center">Scores</h3>
      <div class="flex justify-around">
        <div v-for="player in players" class="text-center">
          <div class="text-lg">{{ player.ign }}: {{ player.points }}</div>
          <form v-if="hosting" class="flex flex-col justify-between gap-2">
            <input type="text" v-model="points"/>
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
      questionHidden: false,
      players: [],
      categories: [],
      question: {},
      level: 1,
      points: 0
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
      this.level = 1
    })
    this.on("show-question", (question) => {
      this.status = "question"
      this.question = question
      this.points = question.points
    })
    this.emit("set-player")
    this.on("next-clue", () => {
      this.level++
    })
    this.on("hide-question", (show) => {
      this.questionHidden = show
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
    }, 100)
  }
}
</script>
