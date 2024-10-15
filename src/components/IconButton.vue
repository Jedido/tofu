<template>
  <button class="
    focus:outline-none
    bg-emerald-600
    hover:bg-emerald-500
    active:bg-emerald-800
    rounded
    shadow">
    {{ icon }}
  </button>
</template>

<script>
export default {
  name: "IconButton",
  props: {
    icon: String
  },
}
</script>

<style scoped></style>
