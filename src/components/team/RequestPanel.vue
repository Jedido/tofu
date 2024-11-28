<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      Passcodes
    </template>
    <template v-slot:description>
      Passcodes from 4 different individuals. Use the button to control the feed.
    </template>
    <template v-slot:content>
      <div class="text-center mt-8 rounded w-full">
        <div class="overflow-hidden text-gray-580 mx-auto px-2 py-1 rounded border-t-2 border-b-2 border-gray-800 border-dotted">
        <div 
          class="slideshow relative flex gap-3" 
          :style="[`animation-delay: ${animationOffset}s`, this.paused || !this.active ? 'animation-play-state: paused' : '']"
        >
          <div v-for="requestor in requestors">
            <div class="py-3">
              <div class="text-4xl font-mono uppercase requestor text-center">
                {{ requestor.name }}
              </div>
              <div class="flex justify-center gap-3 py-2">
                <div
                  v-for="s in requestor.sequence" 
                  class="h-12 w-12 rounded-3xl border-gray-800"
                  :class="[colors[s]]">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-2">
        <i
          class="text-5xl cursor-pointer" 
          :class="{
            'bi-play-circle-fill text-emerald-600': this.paused,
            'bi-pause-circle-fill text-gray-500': !this.paused
          }"
          @pointerdown.stop="togglePause"></i>
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
      Confirm Passcode
    </template>
    <template v-slot:description>
      Please submit the passcode sequence for {{ state.name }}.
    </template>
    <template v-slot:content>
      <div class="text-center mt-10 text-3xl">
        {{ state.name }}
      </div>
      <div class="flex justify-around mt-4">
        <div
          v-for="(color, i) in colors"
          class="button"
          :class="[color]"
          @pointerdown.stop="pressed(i)"></div>
      </div>
      <div class="flex justify-center gap-2 mt-8">
        <div
          v-for="i in 4"
          class="h-4 w-4 rounded-lg"
          :class="[sequence.length >= i ? colors[sequence[i - 1]] : 'bg-gray-800']"
        ></div>
        <i
          class="bi-arrow-counterclockwise text-xl -my-1 text-gray-900 cursor-pointer" 
          @pointerdown.stop="reset">
        </i>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

export default {
  name: "RequestPanel",
  props: {
    panel: String,
    state: Object,
    active: Boolean
  },
  components: {
    Panel
  },
  emits: ['submit'],
  data() {
    return {
      offset: 0,
      colors: ['red', 'yellow', 'green', 'blue'],
      sequence: [],
      paused: true,
      timer: null,
      animationOffset: -Math.random() * 6
    }
  },
  methods: {
    cycle() {
      if (!this.active && !this.paused) {
        this.togglePause()
        return
      }
    },
    sendSolution() {
      this.$emit('submit', {
        sequence: this.sequence
      })
    },
    pressed(i) {
      if (this.sequence.length < 4) {
        this.sequence.push(i)
      }
    },
    reset() {
      this.sequence = []
    },
    togglePause() {
      if (!this.active) {
        return
      }
      if (this.paused) {
        this.paused = false
      } else {
        this.paused = true
      }
    },
  }, 
  computed: {
    requestors() {
      return this.state.requestors.concat(this.state.requestors)
    }
  }
}
</script>

<style scoped>
.requestor {
  letter-spacing: 10px;
  margin-right: -5px;
  margin-left: 0px;
  width: 232px;
}
.button {
  transition: height 0.05s linear, margin-top 0.05s linear;
  cursor: pointer;
  border-radius: 22px;
  padding: 2px 3px;
  width: 46px;
  height: 50px;
}
.button:active {
  height: 41px;
  margin-top: 9px;
}
.button::before {
  display: block;
  width: 40px;
  height: 36px;
  border-radius: 20px;
  content: ""
}
.red { background-color: #FF5733; }
.red::before { background-color: #FF7F66; }
.yellow { background-color: #FFC300; }
.yellow::before { background-color: #FFD966; }
.green { background-color: #28B463; }
.green::before { background-color: #66D285; }
.blue { background-color: #3498DB; }
.blue::before { background-color: #66B3E6; }
@keyframes slide {
  from {
    right: 0px;
  }
  to {
    right: 960px;
  }
}
.slideshow {
  animation: slide 6s linear infinite;
}
</style>