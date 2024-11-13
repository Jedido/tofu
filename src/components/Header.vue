<template>
  <header class="px-3 py-1 bg-emerald-700 text-emerald-50 flex gap-3 select-none">
    <div class="grow text-lg"><span class="cursor-pointer" @click="leaveRoom">Tofu</span></div>
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
  mounted() {
    this.socket.on("set-user", (ign, id) => {
      this.$store.commit("setIgn", ign)
      this.$store.commit("setId", id)
      this.ign = ign
    })
  },
  methods: {
    leaveRoom() {
      this.socket.emit("leave-room")
      this.$store.commit("leaveRoom")
    }
  }
}
</script>

<style scoped></style>
