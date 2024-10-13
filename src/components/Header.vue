<template>
  <header class="p-3 bg-emerald-700 text-emerald-50 grid gap-2">
    <span class="truncate text-right">Username</span>
    <div>
      <input
        type="text"
        id="ign"
        v-model="ign"
        class="outline-none w-full bg-emerald-600 rounded px-2 shadow"
      />
    </div>
    <button
      class="
        focus:outline-none
        row-span-2
        bg-emerald-600
        hover:bg-emerald-500
        active:bg-emerald-800
        rounded
        shadow
      "
      @click="setIgn()"
    >
      Set
    </button>
    <p class="row-start-2 truncate text-right">User ID</p>
    <span
      class="
        row-start-2
        bg-emerald-800
        text-emerald-200
        rounded
        px-2
        shadow-inner
        cursor-not-allowed
        select-none
        truncate
      "
      >{{ this.$store.state.id }}</span
    >
  </header>
</template>

<script>
export default {
  name: "Header",
  props: {
    msg: String,
    socket: Object,
  },
  data() {
    return {
      ign: "",
      userId: "loading...",
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
    setIgn() {
      if (this.ign.search(/user/) === -1) {
        this.socket.emit("set-ign", this.ign)
      } else {
        alert('Username cannot contain the string "user" in it!')
      }
    },
  },
}
</script>

<style scoped></style>
