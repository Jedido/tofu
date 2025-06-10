<template>
  <header
    class="px-3 py-1 flex gap-3 select-none absolute left-0 right-0 z-40"
    :class="{
      'bg-none text-emerald-700': !!$store.state.room,
      'bg-emerald-700 text-emerald-50': !$store.state.room
    }"
  >
    <div class="grow text-lg">
      Tofu
      <span v-show="$store.state.room" class="text-sm text-emerald-500">#{{ $store.state.room }}</span>
      <span v-show="$store.state.room" @click="leaveRoom" class="ml-1 text-xs text-emerald-500 cursor-pointer">(Leave)</span>
    </div>
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
