<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Dot Quota
    </template>
    <template v-slot:description>
      The dot quota for {{ state.count }} {{ state.color }} dice. Only count the colored dots.
    </template>
    <template v-slot:content>
      <div class="pt-4 h-full">
        <div class="flex flex-wrap text-4xl justify-center px-6 gap-1">
          <div v-for="i in 36" class="-mx-1 -my-1">
            <i class="bi-dot" :style="[getAsBoolean(i - 1, state.dots) ? `color: ${state.color};`: '']"></i>
          </div>
        </div>
      </div>
    </template>
  </Panel>
  <Panel
    v-else-if="panel === 'p'"
    :active="active"
    :panel-type="panel"
    @submit="sendSolution"
  >
    <template v-slot:title >
      {{ state.color }} Dice
    </template>
    <template v-slot:description >
      Reroll the dice until you hit the exact amount for the quota.
    </template>
    <template v-slot:content>
      <div 
        class="flex flex-wrap justify-center items-center h-full text-6xl gap-3 py-4"
        :style="`color: ${state.color};`"
      >
        <div v-for="(value, i) in state.dice" class="px-6">
          <i :class="[`bi-dice-${value} cursor-pointer`]" @pointerdown.stop="roll(i)"></i>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

import bitwise from '@/mixins/bitwise';

export default {
  name: "DicePanel",
  props: {
    panel: String,
    state: Object,
    active: Boolean
  },
  components: {
    Panel
  },
  mixins: [bitwise],
  emits: {
    'submit': false
  },
  data() {
    return {
      rerolling: Array(this.state.dice?.length || 0).fill(false)
    }
  },
  methods: {
    roll(i) {
      if (!this.rerolling[i]) {
        this.reroll(i, 10)
      }
    },
    reroll(i, times) {
      this.rerolling[i] = times > 0
      if (!this.rerolling[i]) {
        return
      }
      this.state.dice[i] = Math.ceil(Math.random() * 6)
      setTimeout(() => this.reroll(i, times - 1), 50)
    },
    sendSolution() {
      this.$emit('submit', {
        sum: this.state.dice.reduce((a, b) => a + b, 0)
      })
    }
  }
}
</script>

<style scoped>
</style>