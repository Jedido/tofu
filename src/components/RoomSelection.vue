<template>
  <div class="bg-white p-4">
    <form class="mb-4 flex flex-col justify-center items-center" @submit.prevent="joinRoom">
      <label>
        <p class="text-lg select-none">Join with a Room Code</p>
        <input
          id="room-input"
          v-model="room"
          type="text"
          maxlength="5"
          spellcheck="false"
          class="outline-none mx-auto uppercase"
          autocomplete="off"
        />
      </label>
      <button class="border-2 border-emerald-500 rounded hover:border-emerald-400 mt-3 mx-auto py-3 w-full" @click.prevent="joinRoom">Join</button>
    </form>
    <h2 class="text-xl py-2">Create a Room</h2>
    <div class="grid grid-cols-3 gap-3 w-full">
      <GameChoice
        v-for="(game, index) in games"
        v-bind="{ ...$attrs, ...game }"
        :key="index"
      />
    </div>
  </div>
</template>

<script>
import GameChoice from "./GameChoice.vue"
import socket from "@/mixins/socket";

export default {
  name: "GameSelection",
  components: { GameChoice },
  mixins: [socket],
  data() {
    return {
      games: [
        { name: "Anagram", scene: "anagram" },
        { name: "Minesweeper", scene: "minesweeper" },
        { name: "Example Game", scene: "example" },
        { name: "Gacha Game", scene: "gacha" },
        { name: "Watch Together", scene: "watch" },
        { name: "Jeopardy!", scene: "jeopardy" },
        { name: "Squaredle", scene: "squaredle" },
        { name: "Sandbox", scene: "sandbox" },
        { name: "Team", scene: "team" },
      ],
      room: "",
    }
  },
  mounted() {
    this.socket.on("set-room", (room) => {
      this.logs = []
      this.$store.commit("setRoom", room)
    })
  },
  methods: {
    joinRoom() {
      this.logs = []
      this.socket.emit("join-room", this.room)
      this.room = ""
    },
  }
}
</script>

<style scoped>
#room-input {
  border: none;
  width: 7.5ch;
  padding: 0px;
  margin-left: 0.5ch;
  background: repeating-linear-gradient(
      90deg,
      dimgrey 0,
      dimgrey 1ch,
      transparent 0,
      transparent 1.5ch
    )
    0 100%/100% 2px no-repeat;
  color: #2c3e50;
  font: 5ch consolas, monospace;
  letter-spacing: 0.5ch;
}
</style>