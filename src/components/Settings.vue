<template>
  <Modal>
    <div class="w-64 flex flex-col gap-2">
      <h1 class="text-xl mb-2">Settings</h1>
      <form class="grid grid-cols-4 gap-2 header-form text-md" @submit.prevent="setIgn()">
        <span class="text-right">Name</span>
        <div class="col-span-2 relative">
          <input
            type="text"
            id="ign"
            title="edit"
            v-model="ign"
            class="outline-none w-full bg-white rounded px-2 border border-1 border-gray-800 disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-800"
            :disabled="!editIgn"
          />
          <div v-if="!editIgn" class="absolute left-0 right-0 top-0 bottom-0 cursor-pointer" @click="focusIgn()"></div>
        </div>
        <div class="pl-1">
          <div v-if="!editIgn" class="flex align-center icon">
            <i class="bi-pencil-fill text-cyan-500 cursor-pointer" @click.prevent="focusIgn"></i>
          </div>
          <div v-else class="flex gap-3 text-lg icon align-center">
            <i class="bi-check-circle text-emerald-500 cursor-pointer" @click.prevent="setIgn"></i>
            <i class="bi-x-circle text-error cursor-pointer" @click.prevent="resetIgn"></i>
          </div>
        </div>
        <p class="row-start-2 text-right">ID</p>
        <span
          class="
            col-span-2
            row-start-2
            bg-gray-200
            border border-1 border-gray-300
            text-gray-800
            rounded
            px-2
            cursor-not-allowed
            select-none
            truncate
          "
          >{{ this.$store.state.id }}</span
        >
      </form>
      <div class="flex gap-3 col-span-2">
        <span>Scale: {{ $store.state.scale.toFixed(1) }}x</span>
        <i class="bi-zoom-out cursor-pointer text-cyan-500" @pointerdown.prevent="changeScale(-0.1)"></i>
        <i class="bi-zoom-in cursor-pointer text-cyan-500"  @pointerdown.prevent="changeScale(0.1)"></i>
      </div>
      <div v-if="$store.state.room">
        <span>
          Room: {{ $store.state.room }}
        </span>
        <span class="cursor-pointer text-xs text-error ml-1" @click.prevent="leaveRoom">(Leave)</span>
      </div>
    </div>
  </Modal>
</template>

<script>
import IconButton from './IconButton.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: "Header",
  components: {
    IconButton,
    Modal
  },
  props: {
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
    this.socket.on("set-user", (user) => {
      this.$store.commit("setIgn", user.ign)
      this.$store.commit("setId", user.id)
      this.ign = user.ign
      localStorage.setItem("user", JSON.stringify(user))
    })
  },
  methods: {
    async focusIgn() {
      this.editIgn = true
      await this.$nextTick()
      this.ign = ""
      document.getElementById("ign").focus()
    },
    setIgn() {
      if (this.editIgn) {
        this.editIgn = false
        this.socket.emit("set-ign", this.ign)
        const user = localStorage.setItem("user", JSON.stringify(user))
        user.ign = this.ign
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        this.editIgn = true
      }
    },
    resetIgn() {
      this.editIgn = false
      this.ign = this.$store.state.ign
    },
    leaveRoom() {
      history.pushState({}, null, '/')
      this.socket.emit("leave-room")
      this.$store.commit("leaveRoom")
      this.$emit("dismiss")
    },
    changeScale(amount) {
      this.$store.commit("changeScale", amount)
    }
  },
}
</script>

<style scoped>
#ign:disabled {
  user-select: none;
}
.icon {
  line-height: 26px;;
}
</style>
