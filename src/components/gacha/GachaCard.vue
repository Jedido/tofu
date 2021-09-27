<template>
  <div class="bg-white w-100">
    <CharacterCard v-if="revealed" :character="character" />
    <button
      v-else
      class="
        focus:outline-none
        bg-gray-600
        hover:bg-gray-500
        active:bg-gray-800
        rounded
        shadow
      "
      @click="reveal"
    >
      Reveal {{ character }}
    </button>
    <div id="animation" />
  </div>
</template>

<script>
import CharacterCard from "./CharacterCard.vue"

export default {
  name: "GachaCard",
  components: {
    CharacterCard,
  },
  props: {
    character: [Object, Number],
  },
  computed: {
    revealed() {
      return typeof this.character === "object"
    },
  },
  methods: {
    reveal() {
      this.$emit("recruit")
    },
  },
}
</script>
