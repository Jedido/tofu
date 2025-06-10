<template>
  <div class="flex justify-center items-center mx-auto h-16" @pointerdown="setControl">
    <i class="bi-box-arrow-down text-white text-4xl"></i>
  </div>
</template>

<script>
export default {
  name: "SubmitTool",
  methods: {
    setControl() {
      this.$emit("update-control", {})
    }
  }
}
</script>
