<template>
  <div class="flex gap-4 text-lg bg-gray-800 rounded-lg p-1 border-4" :class="{
    'border-emerald-500': correct === true,
    'border-gray-800': correct === null,
    'border-error': correct === false
  }">
    <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-700 text-4xl text-gray-200 flex items-center justify-center">
      <img v-if="image_url" :src="image_url" class="relative top-1/2 -translate-y-2/4" />
      <span v-else>{{ title.charAt(0) }}</span>
    </div>
    <div class="flex flex-col grow">
      <div class="text-white font-semibold">{{ user }}</div>
      <div class="text-amber-500 mt-2">{{ title }}</div>
    </div>
    <div class="flex items-center text-4xl text-white mr-4">
      <div v-if="correct === true">
        <i class="bi bi-check-circle-fill"></i>
      </div>
      <div v-else-if="correct === false">
        <i class="bi bi-x-circle-fill"></i>
      </div>
      <div v-else>
        <i class="bi bi-three-dots"></i>
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: "GuessCard",
    props: {
      title: String,
      user: String,
      image_url: String | null,
      correct: Boolean | null
    }
  }
  </script>