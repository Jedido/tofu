<template>
  <div id="gacha" class="select-none">
    <p class="text-center text-3xl mb-4">Gacha Game</p>
    <div v-if="state === 1" class="grid-cols-5">
      <GachaCard
        v-for="(character, index) in recruitQueue"
        :key="index"
        :character="character"
        @recruit="recruit(index)"
      />
      <button class="bg-emerald-700 row-span-5" @click="endRecruit">
        End Session
      </button>
    </div>
    <div v-else>
      <button @click="startRecruiting">Start Recruiting!</button>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"
import GachaCard from "./GachaCard.vue"

export default {
  name: "GachaGame",
  mixins: [socket],
  components: {
    GachaCard,
  },
  data() {
    return {
      recruitQueue: [],
      recruits: {},
      state: 0,
    }
  },
  mounted() {
    this.on("start", (cards) => {
      this.recruitQueue = cards
      this.state = 1
    })
    this.on("recruit-result", (index, character) => {
      console.log(character)
      this.recruitQueue[index] = character
    })
    this.on("summary", (sessionResult) => {
      console.log(sessionResult)
      this.state = 0
    })
    this.on("stats", (stats) => {
      console.log(stats)
    })
  },
  methods: {
    startRecruiting() {
      this.emit("start-recruit")
    },
    recruit(index) {
      this.emit("recruit", { index })
    },
    endRecruit() {
      this.emit("end-recruit")
    },
    getStats() {
      this.emit("get-stats")
    },
  },
}
</script>

<style scoped></style>
