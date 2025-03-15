<template>
  <span v-html="boldInput"></span>
</template>

<script>
export default {
  name: "AutocompleteSuggestion",
  props: {
    suggestion: String,
    currentInput: String
  },
  computed: {
    boldInput() {
      const index = this.suggestion.toLowerCase().indexOf(this.currentInput.toLowerCase())
      if (index === -1) {
        return this.suggestion
      }
      return this.suggestion.substring(0, index) + '<b>' + this.suggestion.substring(index, index + this.currentInput.length) + '</b>' + this.suggestion.substring(index + this.currentInput.length)
    }
  }
}
</script>
