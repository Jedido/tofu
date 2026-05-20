<template>
  <Panel
    v-if="panel === 'k1'"
    :active="active"
    :panel-type="panel"
    @submit="$emit('submit')"
  >
    <template #title> Passcodes </template>
    <template #description>
      Passcodes from 4 different individuals. Use the button to control the
      feed.
    </template>
    <template #content>
      <div class="text-center mt-8 rounded w-full">
        <div
          class="overflow-hidden text-gray-580 mx-auto px-2 py-1 rounded border-t-2 border-b-2 border-gray-800 border-dotted"
        >
          <div
            class="slideshow relative flex gap-3"
            :style="[
              `animation-delay: ${animationOffset}s`,
              paused || !active ? 'animation-play-state: paused' : '',
            ]"
          >
            <div v-for="requestor in requestors" :key="requestor.name">
              <div class="py-3">
                <div class="text-4xl font-mono uppercase requestor flex">
                  <div
                    v-for="(c, i) in requestor.name"
                    :key="i"
                    class="w-6 mr-[6px]"
                  >
                    {{ c }}
                  </div>
                </div>
                <div class="flex justify-center gap-3 py-2">
                  <div
                    v-for="(s, i) in requestor.sequence"
                    :key="i"
                    class="h-12 w-12 rounded-3xl border-gray-800"
                    :class="[colors[s]]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-2">
          <i
            class="text-5xl cursor-pointer"
            :class="{
              'bi-play-circle-fill text-emerald-600': paused,
              'bi-pause-circle-fill text-gray-500': !paused,
            }"
            @pointerdown.stop="togglePause"
          ></i>
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
    <template #title> Confirm Passcode </template>
    <template #description>
      Please submit the passcode sequence for {{ state.name }}.
    </template>
    <template #content>
      <div class="text-center mt-10 text-3xl">
        {{ state.name }}
      </div>
      <div class="flex justify-around mt-4">
        <div
          v-for="(color, i) in colors"
          :key="i"
          class="button"
          :class="[color]"
          @pointerdown.stop="pressed(i)"
        ></div>
      </div>
      <div class="flex justify-center gap-2 mt-8">
        <div
          v-for="i in 4"
          :key="i"
          class="h-4 w-4 rounded-lg"
          :class="[
            sequence.length >= i ? colors[sequence[i - 1]] : 'bg-gray-800',
          ]"
        ></div>
        <i
          class="bi-arrow-counterclockwise text-xl -my-1 text-gray-900 cursor-pointer"
          @pointerdown.stop="reset"
        >
        </i>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from "@/components/team/Panel.vue"

export default {
  name: "RequestPanel",
  components: {
    Panel,
  },
  props: {
    panel: { type: String, required: true },
    state: { type: Object, required: true },
    active: Boolean,
  },
  emits: ["submit"],
  data() {
    return {
      offset: 0,
      colors: ["red", "yellow", "green", "blue"],
      sequence: [],
      paused: true,
      timer: null,
      animationOffset: -Math.random() * 6,
    }
  },
  computed: {
    requestors() {
      return this.state.requestors.concat(this.state.requestors)
    },
  },
  methods: {
    cycle() {
      if (!this.active && !this.paused) {
        this.togglePause()
        return
      }
    },
    sendSolution() {
      this.$emit("submit", {
        sequence: this.sequence,
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
  transition:
    height 0.05s linear,
    margin-top 0.05s linear;
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
  content: "";
}
.red {
  background-color: #ff5733;
}
.red::before {
  background-color: #ff7f66;
}
.yellow {
  background-color: #ffc300;
}
.yellow::before {
  background-color: #ffd966;
}
.green {
  background-color: #28b463;
}
.green::before {
  background-color: #66d285;
}
.blue {
  background-color: #3498db;
}
.blue::before {
  background-color: #66b3e6;
}
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
