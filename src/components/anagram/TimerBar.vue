<template>
  <div class="bg-gray-200">
    <div
      :class="['bg-emerald-500 h-full w-full', { drain: active }]"
      :style="{
        transition: `width ${time}ms linear, background-color ${
          time - 200
        }ms ease-in`,
      }"
    ></div>
  </div>
</template>

<script>
const RESET_MILLIS = 200

export default {
  name: "TimerBar",
  data() {
    return {
      time: 0,
      active: false,
      timer: -1,
    }
  },
  methods: {
    reset() {
      this.time = RESET_MILLIS
      this.active = false
      clearTimeout(this.timer)
    },
    set(time) {
      this.reset()
      setTimeout(() => {
        this.active = true
        this.time = time - RESET_MILLIS
      }, RESET_MILLIS)
      this.timer = setTimeout(() => {
        this.$emit("timer")
      }, time)
    },
  },
}
</script>

<style scoped>
.drain {
  width: 0px;
  background-color: #ef4444;
}
</style>
