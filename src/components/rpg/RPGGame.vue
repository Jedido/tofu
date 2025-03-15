<template>
  <div id="rpg" class="overflow-x-hidden">
    <h2 class="text-2xl text-center">{{ title }}</h2>
    <div class="h-64">
      <div v-if="enemy.name">
        {{ enemy.name }}
        {{ enemy.hp }}/{{ enemy.maxHp }}
      </div>
      <div v-else-if="items.length > 0">
        <div v-for="item in items">{{ item.name }}</div>
      </div>
    </div>
    <div class="flex justify-around">
      <div v-for="player in players" class="border-2 border-emerald-500 rounded bg-white w-32 p-2">
        {{ player.name }}
        {{ player.hp }}/{{ player.maxHp }}
      </div>
    </div>
    <div class="flex flex-col bg-white p-2 h-96 justify-end leading-snug">
      <div class="mt-1" v-for="log in logs">
        {{ log }}
      </div>
      <div v-if="loading">Loading...</div>
    </div>
    <div class="w-full">
      <button v-if="!started" class="p-2 w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="emit('start')">Start</button>
      <div v-else-if="awaitingAction" class="grid grid-cols-6 gap-2">
        <input type="text" v-model="action" class="py-2 w-full col-span-5 border-2" />
        <button class="p-2 w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="submitAction()">Submit Action</button>
      </div>
      <button v-else class="p-2 w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="emit('next')">Next</button>
    </div>
  </div>
</template>

<script>
import socket from "@/mixins/socket.js"
import breakpoints from "@/mixins/breakpoints.js"

export default {
  name: "RPGGame",
  mixins: [socket, breakpoints],
  components: {
  },
  data() {
    return {
      started: false,
      loading: false,
      title: "RPG",
      logs: [],
      action: "",
      enemy: {},
      items: [],
      players: [],
      awaitingAction: false
    }
  },
  mounted() {
    this.on("loading", () => {
      this.loading = true
      this.started = true
      this.awaitingAction = false
    })
    this.on("init-game", ({ setting: { title, premise, classes }, players }) => {
      this.title = title
      this.loading = false
      this.logs = [premise]
      this.items = classes.map(c => {
        return {
          name: c,
          description: `Start as a ${c}`
        }
      })
      this.players = players
    })
    this.on("encounter", (enemy) => {
      this.logs.push(`The party comes across ${enemy.description}`)
      this.enemy = enemy
      this.loading = false
    })
    this.on("request-action", () => {
      this.logs.push("It is now your turn.")
      this.loading = false
      this.awaitingAction = true
    })
    this.on("attempt-action", ({ p, name, action }) => {
      this.logs.push(`${name}: ${action}`)
      this.logs.push(`Difficulty: ${p}%`)
      this.loading = false
    })
    this.on("action-roll", ({ roll }) => {
      this.logs.push(`Rolled a ${roll}`)
    }) 
    this.on("action-result", ({ result: { description, result }, players, enemy }) => {
      this.logs.push(description)
      result.forEach((r) => {
        this.logs.push(`${r.name} took ${r.damage} damage!`)
      })
      this.logs.push()
      this.loading = false
      this.enemy = enemy
      this.players = players
    })
    this.on("item-selected", () => {
      this.items = []
    })
  },
  methods: {
    submitAction() {
      this.emit("attempt-action", { message: this.action })
    }
  },
}
</script>

<style scoped>
</style>
