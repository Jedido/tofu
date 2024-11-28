<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Q{{ state.n }} Cheat Sheet
    </template>
    <template v-slot:description>
      Solve for the requested variable. It will be used in a later equation.
    </template>
    <template v-slot:content>
      <div class="h-full text-4xl flex flex-col justify-center pb-2 gap-1 text-gray-600">
        <div v-for="equation in equations" class="pl-6 border-b-2 border-cyan-300">
          <span class="pl-4 border-l-2 border-error py-10">
            {{ equation }}
          </span>
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
      Question #{{ state.n }}
    </template>
    <template v-slot:description >
      Solve for {{ state.y }}.
      <span v-if="state.hint">Since this is the first equation, you have additional information. Please do not forget your answer.</span>
    </template>
    <template v-slot:content>
      <div class="h-full font-serif text-4xl text-center flex flex-col justify-around">
        <div>
          <div v-if="state.hint" class="mb-3">
            0. {{ state.hint }}
          </div>
          {{ state.n }}. {{ state.y }} = ?
        </div>
        <div class="shrink flex justify-center">
          <i class="bi-dash-circle text-3xl leading-relaxed text-error cursor-pointer" @pointerdown.stop="increment(-1)"></i>
          <span class="text-4xl text-center w-16">{{ number }}</span>
          <i class="bi-plus-circle text-3xl leading-relaxed text-emerald-500 cursor-pointer" @pointerdown.stop="increment(1)"></i>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

import bitwise from '@/mixins/bitwise';

export default {
  name: "AlgebraPanel",
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
    const equations = this.state.equations?.map(e => this.displayFormat(e))
    if (equations) {
      equations.unshift('notes')
    }
    return {
      equations,
      rerolling: Array(this.state.dice?.length || 0).fill(false),
      number: 0
    }
  },
  methods: {
    increment(i) {
      this.number += i
      if (this.number < 0) {
        this.number = 0
      } else if (this.number > 9) {
        this.number = 9
      }
    },
    sendSolution() {
      this.$emit('submit', {
        y: this.number
      })
    },
    displayFormat(equation) {
      const m = Math.abs(equation.m) !== 1 ? equation.m : ''
      const x = this.state.x
      const op = equation.b > 0 ? '+ ' : (equation.b === 0 ? '' : '- ')
      const b = equation.b !== 0 ? `${Math.abs(equation.b)} ` : ''
      const y = equation.y
      const n = Math.abs(equation.n) !== 1 ? equation.n : ''
      return `${m}${x} ${op}${b}= ${n}${y}`
    }
  }
}
</script>

<style scoped>
.red { color: #FF5733; }
.yellow { color: #FFC300; }
.green { color: #28B463; }
.blue { color: #3498DB; }
</style>