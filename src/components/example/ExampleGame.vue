<template>
  <div id="example" class="select-none text-amber-900">
    <p class="text-center text-3xl mb-4">Send Messages</p>
    <div
      class="
        flex flex-col
        items-center
        bg-amber-100
        rounded
        mt-auto
        border-4 border-amber-200
        mx-10
      "
    >
      <div class="h-80 p-4 w-full overflow-y-auto leading-4 text-sm">
        <p v-for="[s, m] in messages" class="mb-2" :key="s + m">
          <span class="font-semibold">{{ s }}</span
          >: {{ m }}
        </p>
      </div>
      <div class="grid grid-cols-6 w-full border-t-2 border-amber-200">
        <input
          v-model="message"
          type="text"
          id="input"
          class="outline-none bg-amber-50 px-4 py-2 col-span-5"
          placeholder="Send a message..."
        />
        <button
          class="focus:outline-none bg-amber-200 hover:bg-amber-300 text-lg"
          @click="this.sendMessage()"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../mixins/socket.js"

export default {
  name: "ExampleGame",
  mixins: [socket],
  props: {
    gameWidth: Number,
  },
  data() {
    return {
      message: "",
      messages: [],
    }
  },
  created() {
    console.log("example game has been created")
  },
  mounted() {
    console.log("example game has been mounted")
    this.on("receive-message", (sender, message) => {
      this.messages.push([sender, message])
    })
  },
  unmounted() {
    console.log("example game has been unmounted")
  },
  methods: {
    sendMessage() {
      console.log(this.message)
      this.emit("send-message", this.message)
      this.message = ""
    },
  },
}
</script>

<style scoped></style>
