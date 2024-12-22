<template>
  <header class="px-3 py-1 bg-emerald-700 text-emerald-50 flex gap-3 select-none">
    <div class="grow text-lg"><span class="cursor-pointer" @click="leaveRoom">Tofu</span><span v-show="$store.state.room" class="ml-2 text-sm text-emerald-200">#{{ $store.state.room }}</span></div>
    <i class="bi-chat-dots cursor-pointer text-lg" @click="showLogs = true"></i>
    <i class="bi-gear cursor-pointer text-lg" @click="showSettings = true"></i>
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
    }
  },
  methods: {
    leaveRoom() {
      history.pushState({}, null, '/')
      this.socket.emit("leave-room")
      this.$store.commit("leaveRoom")
    }
  }
}
</script>

<style scoped>
header {
  transition: top 0.2s;
}
</style>
