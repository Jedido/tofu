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
import DangerPanel from '@/components/team/DangerPanel.vue';
import EmptyPanel from '@/components/team/EmptyPanel.vue';
import PatternPanel from '@/components/team/PatternPanel.vue';
import RequestPanel from '@/components/team/RequestPanel.vue';
import WirePanel from '@/components/team/WirePanel.vue';
import DicePanel from '@/components/team/DicePanel.vue';
import WantedPanel from '@/components/team/WantedPanel.vue';
import AlgebraPanel from '@/components/team/AlgebraPanel.vue';
import WordPanel from '@/components/team/WordPanel.vue';
import AddressPanel from '@/components/team/AddressPanel.vue';

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