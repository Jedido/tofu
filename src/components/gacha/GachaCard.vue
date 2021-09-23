<template>
  <div class="bg-white">
    <div v-if="revealed">Revealed</div>
    <div v-else>Pull</div>
    <div id="animation" />
  </div>
</template>

<script>
export default {
  name: "GachaCard",
  props: {
    character: Object,
  },
  data() {
    return {
      revealed: false,
    }
  },
}
</script>
