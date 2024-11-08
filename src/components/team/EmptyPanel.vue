<template>
  <Panel panel-type="d">
    <template v-slot:title>
      Null
    </template>
    <template v-slot:content>
      <div class="text-center text-gray-200">
        <i class="bi-slash-circle-fill large-icon text-center relative"></i>
      </div>
    </template>
    <template v-slot:description>
      No data. Work on something else.
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "EmptyPanel",
  components: {
    Panel,
  }
}
</script>

<style scoped>
.large-icon {
  top: 6px;
  font-size: 12em;
  line-height: 1.25em;
}
</style>