<template>
  <DangerPanel
    v-if="currentPanel.puzzle === 'd'"
    v-bind="panelInfo"
    :key="`d-${currentPanel.id}`"
  />
  <WirePanel
    v-else-if="currentPanel.puzzle === 'w'"
    v-bind="panelInfo"
    :key="`w-${currentPanel.id}`"
  />
  <EmptyPanel v-else />
</template>

<script>
import DangerPanel from './DangerPanel.vue';
import EmptyPanel from './EmptyPanel.vue';
import WirePanel from './WirePanel.vue';

export default {
  name: "PanelType",
  components: {
    DangerPanel,
    WirePanel,
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