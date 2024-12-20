<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Letter Pyramid
    </template>
    <template v-slot:description>
      Reusable letters for {{ state.name }}'s keywords. Tap the spotlight to change its color.
    </template>
    <template v-slot:content>
      <div class="relative">
        <div class="spotlight absolute -top-4 left-0 right-0 mx-auto w-56 h-56 rounded-full cursor-pointer" :class="[`bg-${colors[colorIndex]}`]" @pointerdown.stop="cycleSpotlight()">
        </div>
        <div class="relative top-0 left-0 flex flex-col items-center text-5xl mt-6 font-serif pointer-events-none">
          <div class="h-16 w-14 text-center overflow-x-hidden curser-pointer">
            <div class="border-b-2 border-white" :class="[letterColor(state.letters[0])]">
              {{ state.letters[0] }}
            </div>
          </div>
          <div class="flex gap-1">
            <div v-for="letter in state.letters.slice(1, 3)" class="h-16 w-14 text-center overflow-x-hidden">
              <div class="border-b-2 border-white" :class="[letterColor(letter)]">
                {{ letter }}
              </div>
            </div>
          </div>
          <div class="flex gap-1">
            <div v-for="letter in state.letters.slice(3, 6)" class="h-16 w-14 text-center overflow-x-hidden">
              <div class="border-b-2 border-white"  :class="[letterColor(letter)]">
                {{ letter }}
              </div>
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
      Select all words that can be spelled with {{ state.name }}'s letters.
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
      index: Array(6).fill(0),
      colorIndex: Math.floor(Math.random() * 3),
      colors: ['red', 'green', 'blue']
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
      return this.colors[c.charCodeAt(0) % 3]
    },
    cycleSpotlight() {
      this.colorIndex = (this.colorIndex + Math.ceil(Math.random() * 2)) % 3
    }
  }
}
</script>

<style scoped>
.red {
  color: #ff8258;
}
.bg-red {
  background-color: #ff8258;
}
.green {
  color: #89ff68;
}
.bg-green {
  background-color: #89ff68;
}
.blue {
  color: #62c5ff;
}
.bg-blue {
  background-color: #62c5ff;
}
.spotlight {
  transition: background-color 0.2s;
}
</style>