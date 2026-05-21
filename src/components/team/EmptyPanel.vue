<template>
  <PanelWrapper panel-type="d">
    <template #title> Null </template>
    <template #content>
      <div class="text-center text-gray-200">
        <i class="bi-slash-circle-fill large-icon text-center relative"></i>
      </div>
    </template>
    <template #description> No data. Work on something else. </template>
  </PanelWrapper>
</template>

<script>
import PanelWrapper from "@/components/team/PanelWrapper.vue"

export default {
  name: "EmptyPanel",
  components: {
    PanelWrapper,
  },
}
</script>

<style scoped>
.large-icon {
  top: 6px;
  font-size: 12em;
  line-height: 1.25em;
}
</style>
