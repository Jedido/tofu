<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Letter Pyramid
    </template>
    <template v-slot:description>
      Letters for {{ state.name }}'s keywords. The letters can be reused.
    </template>
    <template v-slot:content>
      <div class="flex flex-col items-center text-5xl mt-6 font-serif">
        <div class="border-2 border-gray-800 rounded h-16 w-14 text-center overflow-x-hidden curser-pointer">
          <div class="border-b-4 border-double" :class="[letterColor(state.letters[0])]">
            {{ state.letters[0] }}
          </div>
        </div>
        <div class="flex gap-1">
          <div v-for="letter in state.letters.slice(1, 3)" class="border-2 border-gray-800 rounded h-16 w-14 text-center overflow-x-hidden">
            <div class="border-b-4 border-double" :class="[letterColor(letter)]">
              {{ letter }}
            </div>
          </div>
        </div>
        <div class="flex gap-1">
          <div v-for="letter in state.letters.slice(3, 6)" class="border-2 border-gray-800 rounded h-16 w-14 text-center overflow-x-hidden">
            <div class="border-b-4 border-double"  :class="[letterColor(letter)]">
              {{ letter }}
            </div>
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
      Keywords
    </template>
    <template v-slot:description >
      Cross out all words that are not {{ state.name }}'s keywords.
    </template>
    <template v-slot:content>
      <div class="text-3xl justify-center py-2 font-serif">
        <div class="text-center mx-auto w-40 border-b-4 border-double border-gray-800">{{ state.name }}</div>
        <div class="ml-14 mt-3">
          <label v-for="(word, i) in state.words" class="flex justify-start gap-6 mt-1" @pointerdown.stop="toggle(i)">
            <i class="text-xl leading-relaxed" :class="{
              'bi-check-square-fill text-emerald-500': selected[i],
              'bi-square text-gray-400': !selected[i]
            }"></i>
            <span class="text-2xl lowercase" :class="{
              'text-gray-400': !selected[i],
              'text-gray-800': selected[i]
            }">{{ word }}</span>
          </label>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "WordPanel",
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
      selected: Array(4).fill(false),
      index: Array(6).fill(0)
    }
  },
  methods: {
    toggle(i) {
      this.selected[i] = !this.selected[i]
    },
    sendSolution() {
      this.$emit('submit', {
        selected: this.selected
      })
    },
    letterColor(c) {
      const colors = ['red', 'yellow', 'green', 'blue']
      return colors[c.charCodeAt(0) % 4]
    }
  }
}
</script>

<style scoped>
.red {
  color: #FF5733;
  border-bottom-color: #FF5733;
}
.yellow {
  color: #FFC300;
  border-bottom-color: #FFC300;
}
.green {
  color: #28B463;
  border-bottom-color: #28B463;
}
.blue {
  color: #3498DB;
  border-bottom-color: #3498DB;
}
</style>