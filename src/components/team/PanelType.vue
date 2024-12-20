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
import WantedPanel from './WantedPanel.vue';
import AlgebraPanel from './AlgebraPanel.vue';
import WordPanel from './WordPanel.vue';
import AddressPanel from './AddressPanel.vue';

export default {
  name: "PanelType",
  components: {
    DangerPanel,
    DicePanel,
    EmptyPanel,
    PatternPanel,
    RequestPanel,
    WantedPanel,
    WirePanel,
    AlgebraPanel,
    WordPanel,
    AddressPanel
  },
  props: {
    currentPanel: Object
  },
  computed: {
    panelType() {
      switch (this.currentPanel.puzzle) {
        case 'd': return DangerPanel
        case 'f': return WantedPanel
        case 'm': return DicePanel
        case 'p': return PatternPanel
        case 'r': return RequestPanel
        case 'w': return WirePanel
        case 'x': return AlgebraPanel
        case 'a': return WordPanel
        case 's': return AddressPanel
        default: return EmptyPanel
      }
    }
  }
}
</script>