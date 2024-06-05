<template>
  <div
    :class="type"
    :style="{ color: `${color}` }"
    @click="revealSpace()"
    @contextmenu.prevent="flagSpace()"
  >
    <img v-if="value === mine" src="@/assets/images/mine.svg"/>
    <img v-else-if="value === explosion" src="@/assets/images/explosion.svg"/>
    <img v-else-if="value === flag" src="@/assets/images/flag.svg"/>
    {{ color ? value : "" }}
  </div>
</template>

<script>
export default {
  name: "AnagramGame",
  props: {
    value: Number,
    active: Boolean,
  },
  data() {
    return {
      mine: -10,
      flag: -20,
      hidden: -30,
      blank: -40,
      explosion: -50,
      colors: [
        "blue",
        "green",
        "red",
        "purple",
        "maroon",
        "turquoise",
        "black",
        "gray",
      ],
    }
  },
  methods: {
    revealSpace() {
      if (this.value === this.hidden) {
        this.$emit("revealSpace")
      }
    },
    flagSpace() {
      if (this.value === this.hidden || this.value === this.flag) {
        this.$emit("flagSpace")
      }
    },
  },
  computed: {
    type() {
      switch (this.value) {
        case this.hidden:
          return "bg-gray-300 cursor-pointer"
        case this.flag:
          return "bg-gray-300 cursor-not-allowed"
      }
      return "bg-gray-400"
    },
    color() {
      if (this.value > 0 && this.value < 9) {
        return this.colors[this.value - 1]
      }
      return ""
    },
  },
}
</script>
