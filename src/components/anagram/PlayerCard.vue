<template>
  <div class="grid grid-cols-8 gap-3 text-gray-500">
    <p class="text-right font-semibold">{{ name }}</p>
    <div class="col-span-6">
      <div
        :class="[
          'bar h-6 border',
          {
            'bg-amber-400 border-amber-400':
              !showStrikes || strikes != maxStrikes,
            'bg-gray-300 border-gray-400': showStrikes && strikes == maxStrikes,
          },
        ]"
        :style="{ width: `${(score / max) * 100}%` }"
      >
        <div v-if="showStrikes && strikes != maxStrikes">
          <span class="font-semibold text-error ml-1">{{ strikeText }}</span>
        </div>
      </div>
    </div>
    <span class="font-semibold">{{ score }}</span>
  </div>
</template>

<script>
export default {
  name: "TimerBar",
  props: {
    max: String,
    score: String,
    name: String,
    strikes: Number,
    maxStrikes: String,
  },
  computed: {
    strikeText() {
      return "X ".repeat(this.strikes)
    },
    showStrikes() {
      return this.maxStrikes !== "0"
    },
  },
}
</script>

<style scoped>
.bar {
  transition: width 0.3s;
}
</style>
