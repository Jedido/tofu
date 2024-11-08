<template>
  <DangerPanel
    v-if="currentPanel.puzzle === 'd'"
    v-bind="panelInfo"
    :key="currentPanel.id"
  />
  <EmptyPanel v-else />
</template>

<script>
import DangerPanel from './DangerPanel.vue';
import EmptyPanel from './EmptyPanel.vue';

export default {
  name: "PanelType",
  components: {
    DangerPanel,
    EmptyPanel
  },
  props: {
    currentPanel: Object
  },
  computed: {
    panelInfo() {
      return {
          panel: this.currentPanel.panel,
          state: this.currentPanel.state,
          status: this.currentPanel.status
      }
    }
  }
}
</script>