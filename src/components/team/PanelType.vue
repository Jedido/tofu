<template>
  <component
    :is="panelType"
    v-bind="{
      panel: currentPanel.panel,
      state: currentPanel.state,
      status: currentPanel.status
    }"
    :key="`${currentPanel.puzzle}-${currentPanel.panel}-${currentPanel.id}`"
  />
</template>

<script>
import DangerPanel from './DangerPanel.vue';
import EmptyPanel from './EmptyPanel.vue';
import PatternPanel from './PatternPanel.vue';
import RequestPanel from './RequestPanel.vue';
import WirePanel from './WirePanel.vue';
import DicePanel from './DicePanel.vue';

export default {
  name: "PanelType",
  components: {
    DangerPanel,
    WirePanel,
    RequestPanel,
    EmptyPanel,
    PatternPanel,
    DicePanel
  },
  props: {
    currentPanel: Object
  },
  computed: {
    panelType() {
      switch (this.currentPanel.puzzle) {
        case 'd': return DangerPanel
        case 'w': return WirePanel
        case 'r': return RequestPanel
        case 'p': return PatternPanel
        case 'm': return DicePanel
        default: return EmptyPanel
      }
    }
  }
}
</script>