<template>
  <button class="border-2 border-emerald-500 rounded hover:border-emerald-400 bg-white px-3 py-8" @click="$emit('launchGame', scene)">{{ name }}</button>
</template>

<script>
export default {
  name: "GameChoice",
  props: {
    name: String,
    scene: String,
  },
}
</script>

<style scoped></style>
