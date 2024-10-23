<template>
  <div class="search-result grid grid-cols-2 gap-2 cursor-pointer bg-white mx-auto">
    <img class="row-span-2" :src="thumbnailUrl" />
    <div class="flex flex-col gap-2 pr-2 pt-2">
      <p class="overflow-y-auto max-h-20">{{ title }}</p>
      <p class="text-xs ml-auto">by <strong>{{ channel }}</strong></p>
    </div>
  </div>
</template>


<script>
export default {
  name: "VideoCard",
  props: {
    videoId: String,
    title: String,
    channel: String
  },
  computed: {
    thumbnailUrl() {
      return `https://i.ytimg.com/vi/${this.videoId}/mqdefault.jpg`
    }
  }
}
</script>

<style scoped>
.search-result {
  max-width: 480px;
}
</style>
