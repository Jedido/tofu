<template>
  <span>
    {{ suggestion.substring(0, matchIndex) }}
    <template v-if="matchIndex !== -1">
      <b>
        {{
          suggestion.substring(matchIndex, matchIndex + currentInput.length)
        }}</b
      >{{ suggestion.substring(matchIndex + currentInput.length) }}
    </template>
  </span>
</template>

<script>
export default {
  name: "AutocompleteSuggestion",
  props: {
    suggestion: { type: String, required: true },
    currentInput: { type: String, required: true },
  },
  computed: {
    matchIndex() {
      return this.suggestion
        .toLowerCase()
        .indexOf(this.currentInput.toLowerCase())
    },
  },
}
</script>
