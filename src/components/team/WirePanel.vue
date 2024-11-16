<template>
  <Panel :active="active" :panel-type="panel">
    <template v-slot:title>
      Bomb Disposal Guide
    </template>
    <template v-slot:description>
      <div class="h-20 flex flex-col justify-between">
        <div>
          Step {{ state.order + 1 }}: Cut the {{ wireDescription }} wire.
        </div>
        <div class="text-xs leading-none italic">
          (You may submit this at any time to receive the next card.)
        </div>
      </div>
    </template>
    <template v-slot:content>
      <div class="grid grid-cols-5 text-center mt-4">
        <div class="col-span-5 p-2 text-2xl mb-8 flex justify-center gap-2">
          <i v-for="_ in state.order" class="bi-question text-gray-400"></i>
          <i class="bi-scissors text-gray-800"></i>
          <i v-for="_ in state.quota - state.order - 1" class="bi-question text-gray-400"></i>
        </div>
        <div class="h-12 rounded col-start-2 border border-2 border-gray-600" :style="`background-color: ${state.wire.color};`">
        </div>
        <div class="col-start-2 row-start-3">
          {{ state.wire.color }}
        </div>
        <template v-if="state.wire.stripe">
          <div class="my-2">
            <i class="bi-plus text-gray-600 text-2xl"></i>
          </div>
          <div class="h-12 rounded border border-2 border-gray-600" :style="`background-color: ${state.wire.stripe};`">
          </div>
          <div class="col-start-4 row-start-3">
            {{ state.wire.stripe }}
          </div>
        </template>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "DangerPanel",
  props: {
    panel: String,
    state: Object,
    active: Boolean
  },
  components: {
    Panel
  },
  computed: {
    wireDescription() {
      let description = this.state.wire.color
      if (this.state.wire.stripe) {
        description += `-${this.state.wire.stripe}`
      }
      return description
    }
  }
}
</script>

<style scoped></style>