<template>
  <div>
    <div class="grid grid-cols-6 gap-3 text-gray-500">
      <div class="flex flex-col gap-2">
        <div class="font-semibold">Cipher</div>
        <div
          v-for="cipher in stats.ciphers"
          :key="cipher"
          class="px-3 py-1 bg-white rounded"
        >
          {{ cipher[1] }}
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="font-semibold">Answer</div>
        <div
          v-for="cipher in stats.ciphers"
          :key="cipher"
          class="px-3 py-1 bg-white rounded"
        >
          {{ cipher[0] }}
        </div>
      </div>
      <div class="flex space-around gap-2 col-span-4 text-center">
        <div
          v-for="key in Object.keys(stats.results)"
          :key="key"
          class="flex flex-col gap-2"
        >
          <div class="font-semibold">{{ stats.results[key].ign }}</div>
          <div
            v-for="(cipher, index) in stats.ciphers"
            :key="key + cipher"
            class="px-3 py-1 bg-white rounded"
            :class="{
              'text-error':
                getSubmission(key, index) !== stats.ciphers[index][0],
            }"
          >
            {{ getSubmission(key, index) }}
          </div>
          <div class="font-semibold">{{ stats.results[key].score }}</div>
        </div>
      </div>
    </div>
    <button
      class="mt-3 w-full px-6 py-3 bg-emerald-500 rounded"
      @click="$emit('playAgain')"
    >
      Play Again
    </button>
  </div>
</template>

<script>
export default {
  name: "EndCard",
  props: {
    stats: Object,
  },
  methods: {
    getSubmission(user, round) {
      const submissions = this.stats.results[user].submissions
      return round < submissions.length ? submissions[round] : "?"
    },
  },
}
</script>

<style scoped></style>
