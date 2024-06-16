<template>
  <div v-if="question.type === 'image'" class="h-full col-span-2">
    <div v-if="!preload && level <= 1" class="flex justify-center items-center text-center h-full">Waiting for the host to continue...</div>
    <img v-show="preload || level > 1" class="m-auto h-full" :src="question.question" />
  </div>
  <div v-else-if="question.type === 'text'" class="flex justify-center items-center h-full text-center">
    {{ question.question }}
  </div>
  <div v-else-if="question.type === 'tier'" class="grid grid-cols-2 gap-2 h-full">
    <JeopardyQuestion v-for="q in hints" :question="q" preload/>
  </div>
</template>

<script>
export default {
  name: "JeopardyQuestion",
  props: {
    question: Object,
    level: Number,
    preload: Boolean
  },
  computed: {
    hints() {
      return this.question.question.slice(0, this.level)
    }
  }
}
</script>