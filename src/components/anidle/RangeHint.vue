<template>
  <span class="ml-2">
    <template v-if="formattedMin === formattedMax">
      <span class="text-emerald-400">{{ formattedMin }}</span>
    </template>
    <template v-else>
      <span class="text-amber-500">{{ formattedMin }} - {{ formattedMax }}</span>
    </template>
  </span>
</template>

<script>
export default {
  name: "RangeHint",
  props: {
    min: Number | String | undefined,
    max: Number | String | undefined
  },
  computed: {
    formattedMin() {
      return this.format(this.min)
    },
    formattedMax() {
      return this.format(this.max)
    }
  },
  methods: {
    format(value) {
      if (!value) {
        return "?"
      }
      return typeof value === "number" ? value : new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }
  }
}
</script>