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
      <div v-if="status === 'categories'" class="grid grid-cols-5 gap-2">
        <div v-for="category in categories" class="flex flex-col gap-2 w-100">
          <h2 class="text-center">{{ category.name }}</h2>
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
        </div>
      </div>
      <div
        v-else-if="status === 'question'"
        class="text-2xl bg-white mx-6 h-80"
      >
        <img v-if="question.type === 'image'" class="h-full m-auto" :src="question.question" />
        <div v-else class="p-6 flex justify-center items-center h-full text-center">
          {{ question.question }}
        </div>
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
        <div v-for="player in players">
          <div class="text-lg">{{ player.ign }}: {{ player.points }}</div>
          <div v-if="hosting" class="flex flex-col justify-between gap-2">
            <button
              v-for="i in 11"
              class="
                p-2
                text-amber-50
                bg-emerald-600
                hover:bg-emerald-500
                active:bg-emerald-800
                rounded
              "
              @click.prevent="addPoints(player, i * 100 - 600)"
            >
              {{ i * 100 - 600 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { debounce } from "lodash";
import socket from "../../mixins/socket.js"

export default {
  name: "JeopardyGame",
  mixins: [socket],
  data() {
    return {
      status: "menu",
      host: "None",
      hosting: false,
      players: [],
      categories: [],
      question: {}
    }
  },
  mounted() {
    this.on("update-players", (players) => {
      console.log(players)
      this.players = players
    })
    this.on("update-host", (host) => {
      this.host = host.ign
      this.hosting = host.id === this.$store.state.id
    })
    this.on("show-categories", (categories) => {
      this.status = "categories"
      this.categories = categories
      console.log(categories)
    })
    this.on("show-question", (question) => {
      this.status = "question"
      this.question = question
    })
    this.emit("set-player")
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
