<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      {{ state.name }} Suspects
    </template>
    <template v-slot:description>
      Suspects wanted for case {{ state.name }}.
    </template>
    <template v-slot:content>
      <div class="py-4">
        <div class="text-4xl font-serif text-center">Wanted!</div>
        <div v-if="state.type === 'face'" class="flex justify-center gap-6 flex-wrap text-7xl text-error mt-8">
          <div v-for="face in state.data">
            <i :class="[`bi-emoji-${face} transition-colors`, {
              'text-error': selected[i]
            }]"></i>
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
    <template v-slot:title>
      Case {{ state.name }} Suspects
    </template>
    <template v-slot:description>
      Apprehend the wanted suspects for case {{ state.name }}.
    </template>
    <template v-slot:content>
      <div 
        class="flex flex-wrap justify-center items-center h-full text-6xl gap-3 py-4 text-gray-300"
      >
        <div 
          v-for="(face, i) in state.faces" 
          class="cursor-pointer" 
          :class="{
            'pointer-events-none': !active
          }"
          @pointerdown.stop="select(i)"
        >
          <i :class="[`bi-emoji-${face} transition-colors`, {
            'text-error': selected[i]
          }]"></i>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "WantedPanel",
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
    return {
      selected: Array(this.state.dice?.length || 0).fill(false)
    }
  },
  methods: {
    select(i) {
      this.selected[i] = !this.selected[i]
    },
    sendSolution() {
      this.$emit('submit', {
        selected: this.selected
      })
    }
  }
}
</script>

<style scoped>
</style>