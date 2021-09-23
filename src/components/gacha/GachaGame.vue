<template>
  <div id="gacha" class="select-none">
    <p class="text-center text-3xl mb-4">Gacha Game</p>
    <div v-if="state === 1">
      <GachaCard
        v-for="(character, index) in recruitQueue"
        :key="index"
        :character="character"
        @recruit="recruit"
      />
    </div>
    <div v-if="state === 2">
      <p>history</p>
    </div>
    <div v-else>
      <button @click="startRecruiting">Start Recruiting!</button>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"

export default {
  name: "GachaGame",
  mixins: [socket],
  props: {
    gameWidth: Number,
  },
  data() {
    return {
      recruitQueue: [],
      recruits: {},
      state: 0,
    }
  },
  mounted() {
    this.on("recruit-result", (index, character) => {
      this.recruitQueue[index] = character
    })
  },
  methods: {
    startRecruiting() {
      this.emit("start-recruit")
      this.state = 1
    },
    recruit(index) {
      this.emit("recruit", index)
    },
  },
}
</script>

<style scoped></style>
