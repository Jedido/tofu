<template>
  <div
    :class="type"
    :style="{ color: `${color}` }"
    @click="revealSpace()"
    @contextmenu.prevent="flagSpace()"
  >
    <Mine v-if="value === mine" />
    <Explosion v-else-if="value === explosion" />
    <Flag v-else-if="value === flag" />
    {{ color ? value : "" }}
  </div>
</template>

<script>
import Flag from "@/assets/images/flag.svg"
import Explosion from "@/assets/images/explosion.svg"
import Mine from "@/assets/images/mine.svg"

export default {
  name: "AnagramGame",
  components: {
    Flag,
    Explosion,
    Mine,
  },
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
