<template>
  <div class="bg-white">
    {{ character.name }}
    <div>
      {{ character.rarity }}
    </div>
  </div>
</template>

<script>
export default {
  name: "GachaCard",
  props: {
    character: {
      type: Object,
      required: true,
      validator: (v) => v.name && v.rarity && v.img,
    },
  },
}
</script>
