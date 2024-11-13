<template>
  <div class="h-16 stick rounded relative">
    <div class="relative -left-2 w-2 h-1 bg-gray-900 top-1/2 -translate-y-2/4"></div>
    <div class="relative stick-shadow"></div>
    <div class="absolute left-1/4 -translate-x-1/4 bg-gray-900 w-2/12 top-0 -bottom-px"></div>
    <div class="absolute left-3/4 -translate-x-1/4 bg-gray-900 w-2/12 top-0 -bottom-px"></div>
  </div>
</template>

<script>
export default {
  name: "DynamiteStick",
}
</script>

<style scoped>
.stick {
  background-color: #ef4444;
}
.stick-shadow {
  top: 50px;
  height: 10px;
  background-color: #df3737;
  border-radius: 0 0 4px 4px;
}
</style>