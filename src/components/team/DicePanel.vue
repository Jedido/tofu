<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Dot Quota
    </template>
    <template v-slot:description>
      The dot quota for {{ state.dice }} {{ state.color }} dice. Only count the colored dots.
    </template>
    <template v-slot:content>
      <div class="pt-4 h-full">
        <div class="flex flex-wrap text-4xl justify-center px-6 gap-1">
          <div v-for="colored in dots" class="-mx-1 -my-1">
            <i class="bi-dot" :style="[colored ? `color: ${state.color};`: '']"></i>
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
        <div v-for="(value, i) in dice" class="px-6">
          <i :class="[`bi-dice-${value} cursor-pointer`, {
            'pointer-events-none': !active
          }]" @pointerdown.stop="roll(i)"></i>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

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
  emits: {
    'submit': false
  },
  data() {
    const dice = Array.from({ length: this.state.dice || 0 }, () => Math.ceil(Math.random() * 6))
    const dots = Array(36).fill(false)
    if (this.state.sum) {
      const total = 36
      let colored = this.state.sum
      for (let i = total; i > 0; i--) {
        if (Math.random() < colored / i) {
          colored--
          dots[i - 1] = true
        }
      }
    }
    return {
      dice,
      dots,
      rerolling: Array(dice.length).fill(false),
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
      this.dice[i] = Math.ceil(Math.random() * 6)
      setTimeout(() => this.reroll(i, times - 1), 50)
    },
    sendSolution() {
      this.$emit('submit', {
        sum: this.dice.reduce((a, b) => a + b, 0)
      })
    }
  }
}
</script>

<style scoped>
.cell {
  transition: background-color 0.1s ease-out;
}
.cell i {
  line-height: 48px;
}
</style>