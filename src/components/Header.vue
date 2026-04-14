<template>
  <header
    class="px-3 py-1 flex gap-3 select-none bg-emerald-700 text-emerald-50"
  >
    <div class="grow text-lg">
      Tofu
      <span v-show="$store.state.room" class="text-sm">#{{ $store.state.room }}</span>
      <span v-show="$store.state.room" @click="leaveRoom" class="ml-1 text-xs cursor-pointer">(Leave)</span>
    </div>
    <i class="bi-chat-dots cursor-pointer text-lg" @click="showLogs = true"></i>
    <i class="bi-gear cursor-pointer text-lg" @click="showSettings = true"></i>
    <i v-if="!fullscreenEnabled" class="bi-arrows-angle-expand cursor-pointer text-lg" @click="requestFullscreen"></i>
    <i v-else class="bi-arrows-angle-contract cursor-pointer text-lg" @click="exitFullscreen"></i>
    <Settings v-show="showSettings" :socket="socket" @dismiss="showSettings = false"/>
    <EventLog v-show="showLogs" :socket="socket" @dismiss="showLogs = false"/>
  </header>
</template>

<script>
import EventLog from "@/components/EventLog.vue"
import Settings from "@/components/Settings.vue"

export default {
  name: "Header",
  components: {
    EventLog,
    Settings,
  },
  props: {
    socket: Object,
    room: String
  },
  data() {
    return {
      showSettings: false,
      showLogs: false,
      fullscreenEnabled: false
    }
  },
  methods: {
    leaveRoom() {
      history.pushState({}, null, '/')
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
    }
  }
}
</script>

<style scoped>
header {
  transition: top 0.2s;
}
</style>
