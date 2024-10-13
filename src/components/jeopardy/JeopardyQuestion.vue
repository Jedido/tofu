<template>
  <div v-if="!!buzzer" class="flex justify-center items-center h-full text-center">
    {{ buzzer }} buzzed in!
  </div>
  <div v-else-if="question.type === 'image'" class="h-full col-span-2">
    <div v-if="!preload && level <= 1" class="flex justify-center items-center text-center h-full">Waiting for the host to continue...</div>
    <img v-show="preload || level > 1" class="m-auto h-full" :src="question.question" />
  </div>
  <div v-else-if="question.type === 'zoom'" class="h-full flex justify-center items-center">
    <ZoomImage :state="imageQuestionState" v-bind="question.question" />
  </div>
  <div v-else-if="question.type === 'blur'" class="h-full flex justify-center items-center">
    <BlurImage :state="imageQuestionState" v-bind="question.question" />
  </div>
  <div v-else-if="question.type === 'text'" class="flex justify-center items-center h-full text-center">
    {{ question.question }}
  </div>
  <div v-else-if="question.type === 'tier'" class="grid grid-cols-2 gap-2 h-full">
    <JeopardyQuestion v-for="q in hints" :question="q" preload/>
  </div>
  <div v-if="level === 0" class="text-center mx-auto px-3 py-2 w-fit relative bottom-1/4 bg-white border-2 border-emerald-500 rounded">
    {{ question.answer }}
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue"

export default {
  name: "JeopardyQuestion",
  components: {
    ZoomImage: defineAsyncComponent(() =>
      import("./ZoomImage.vue")
    ),
    BlurImage: defineAsyncComponent(() =>
      import("./BlurImage.vue")
    )
  },
  props: {
    question: Object,
    level: Number,
    preload: Boolean,
    buzzer: String
  },
  computed: {
    hints() {
      return this.question.question.slice(0, this.level)
    },
    imageQuestionState() {
      if (this.level === 1) {
        return 'start'
      } else if (this.level === 2) {
        return 'active'
      } else {
        return 'full'
      }
    }
  }
}
</script>