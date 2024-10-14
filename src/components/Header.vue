<template>
  <header class="p-3 bg-emerald-700 text-emerald-50">
    <form class="grid gap-2 header-form" @submit.prevent="setIgn()">
      <span class="truncate text-right">Username</span>
      <div class="relative">
        <input
          type="text"
          id="ign"
          title="edit"
          v-model="ign"
          class="outline-none w-full bg-emerald-600 rounded px-2 shadow disabled:shadow-inner disabled:bg-emerald-800 disabled:text-emerald-200"
          @blur="resetIgn()"
          :disabled="!editIgn"
        />
        <div v-if="!editIgn" class="absolute left-0 right-0 top-0 bottom-0 cursor-pointer" @click="focusIgn()"></div>
      </div>
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
      <button
        class="
          focus:outline-none
          row-span-2
          col-start-3
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
    </form>
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
      editIgn: false
    }
  },
  mounted() {
    this.socket.on("set-user", (ign, id) => {
      this.$store.commit("setIgn", ign)
      this.$store.commit("setId", id)
      this.ign = ign
    })
    if (localStorage.getItem("ign")) {
      this.socket.emit("set-ign", localStorage.getItem("ign"))
    }
  },
  methods: {
    async focusIgn() {
      this.editIgn = true
      await this.$nextTick()
      this.ign = ""
      document.getElementById("ign").focus()
    },
    setIgn() {
      this.editIgn = false
      this.socket.emit("set-ign", this.ign)
      localStorage.setItem("ign", this.ign)
    },
    resetIgn() {
      this.editIgn = false
      this.ign = this.$store.state.ign
    }
  },
}
</script>

<style scoped>
.header-form {
  grid-template-columns: repeat(3,minmax(0,1fr));
}
#ign:disabled {
  user-select: none;
}

@media (min-width: 768px) {
  .header-form {
    grid-template-columns: repeat(6,minmax(0,1fr));
  }
}
</style>
