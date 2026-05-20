<template>
  <header
    class="px-3 py-1 flex gap-3 select-none bg-emerald-700 text-emerald-50"
  >
    <div class="grow text-lg">
      Tofu
      <span v-show="$store.state.room" class="text-sm"
        >#{{ $store.state.room }}</span
      >
      <span
        v-show="$store.state.room"
        class="ml-1 text-xs cursor-pointer"
        @click="leaveRoom"
        >(Leave)</span
      >
    </div>
    <i class="bi-chat-dots cursor-pointer text-lg" @click="showLogs = true"></i>
    <i class="bi-gear cursor-pointer text-lg" @click="showSettings = true"></i>
    <i
      v-if="!fullscreenEnabled"
      class="bi-arrows-angle-expand cursor-pointer text-lg"
      @click="requestFullscreen"
    ></i>
    <i
      v-else
      class="bi-arrows-angle-contract cursor-pointer text-lg"
      @click="exitFullscreen"
    ></i>
    <AppSettings v-model="showSettings" :socket="socket" />
    <EventLog v-model="showLogs" :socket="socket" />
  </header>
</template>

<script>
import { Socket } from "socket.io-client"

import EventLog from "@/components/EventLog.vue"
import AppSettings from "@/components/AppSettings.vue"

export default {
  name: "AppHeader",
  components: {
    EventLog,
    AppSettings,
  },
  props: {
    socket: Socket,
    room: { type: String, default: "" },
  },
  data() {
    return {
      showSettings: false,
      showLogs: false,
      fullscreenEnabled: false,
    }
  },
  methods: {
    leaveRoom() {
      history.pushState({}, null, "/")
      this.socket.emit("leave-room")
      this.$store.commit("leaveRoom")
    },
    requestFullscreen() {
      this.fullscreenEnabled = true
      if (!document.fullscreenEnabled) {
        alert("Your browser or device does not support fullscreen")
      }
      document.getElementById("app").requestFullscreen()
    },
    exitFullscreen() {
      this.fullscreenEnabled = false
      document.exitFullscreen()
    },
  },
}
</script>

<style scoped>
header {
  transition: top 0.2s;
}
</style>
