<template>
  <Panel
    v-if="panel === 'k1'"
    :active="active"
    :panel-type="panel"
    @submit="$emit('submit')"
  >
    <template #title> {{ state.name }} Suspects </template>
    <template #description>
      Suspects wanted for case {{ state.name }}.
    </template>
    <template #content>
      <div class="py-4">
        <div class="text-4xl font-serif text-center">Wanted!</div>
        <div
          v-if="state.type === 'face'"
          class="flex justify-center gap-6 flex-wrap text-7xl text-amber-300 mt-8"
        >
          <div v-for="(face, i) in state.data" :key="i">
            <i :class="[`bi-emoji-${face}`]"></i>
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
    <template #title> Case {{ state.name }} Suspects </template>
    <template #description>
      Apprehend the wanted suspects for case {{ state.name }}.
    </template>
    <template #content>
      <div
        class="flex flex-wrap justify-center items-center h-full text-6xl gap-3 py-4 text-gray-300"
      >
        <div
          v-for="(face, i) in state.faces"
          :key="i"
          class="cursor-pointer"
          @pointerdown.stop="select(i)"
        >
          <i
            :class="[
              `bi-emoji-${face} transition-colors`,
              {
                'text-amber-300': selected[i],
              },
            ]"
          ></i>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from "@/components/team/Panel.vue"

export default {
  name: "WantedPanel",
  components: {
    Panel,
  },
  props: {
    panel: { type: String, required: true },
    state: { type: Object, required: true },
    active: Boolean,
  },
  emits: {
    submit: false,
  },
  data() {
    return {
      selected: Array(this.state.dice?.length || 0).fill(false),
    }
  },
  methods: {
    select(i) {
      this.selected[i] = !this.selected[i]
    },
    sendSolution() {
      this.$emit("submit", {
        selected: this.selected,
      })
    },
  },
}
</script>

<style scoped></style>
