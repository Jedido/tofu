<template>
  <Panel v-if="panel === 'k1'" :active="active" :panel-type="panel" @submit="$emit('submit')">
    <template v-slot:title>
      {{ state.city }} Map
    </template>
    <template v-slot:description>
      A rough map of {{ state.city }}.
    </template>
    <template v-slot:content>
      <div class="flex flex-col text-xl w-56 justify-around mx-auto text-center gap-3">
        <div class="flex justify-around text-2xl mt-2">
          {{ state.streets[selected] }}
        </div>
        <div class="red h-20 w-56 rounded relative border-2">
          <div class="absolute top-0 left-0 right-0">N</div>
          <div class="flex text-4xl justify-around absolute bottom-0 left-0 right-0">
            <i v-for="(offset, i) in northern"
              class="cursor-pointer"
              :class="{
                'bi-geo-alt-fill': selected === i,
                'bi-geo-alt': selected !== i
              }"
              :style="[`transform: translate(${offset.x}px, ${offset.y}px);`]"
              @pointerdown.stop="selected = i"
            ></i>
          </div>
        </div>
        <div class="blue h-20 w-56 rounded relative border-2">
          <div class="absolute bottom-0 left-0 right-0">S</div>
          <div class="flex text-4xl justify-around absolute top-0 left-0 right-0">
            <i v-for="(offset, i) in southern" 
              class="cursor-pointer"
              :class="{
                'bi-geo-alt-fill': selected === i + 4,
                'bi-geo-alt': selected !== i + 4
              }"
              :style="[`transform: translate(${offset.x}px, ${offset.y}px);`]"
              @pointerdown.stop="selected = i + 4"
            ></i>
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
      {{ state.city }} Post
    </template>
    <template v-slot:description >
      Slide the mail the northern or southern region, based on its location on the map.
    </template>
    <template v-slot:content>
      <div class="text-xl text-center flex flex-col justify-around items-center">
        <div class="text-3xl py-3">
          {{ state.streets[selected] }}
        </div>
        <div class="red h-16 w-56 rounded border-2 relative">
          <div class="absolute top-0 left-0 right-0">N</div>
        </div>
        <div class="flex w-56 justify-around text-4xl">
          <div
            v-for="(_, i) in state.streets"
            class="relative text-gray-400 z-10"
            :class="{
              'text-gray-600': selected === i,
              'transition-transform': !dragging
            }"
            :style="[`transform: translateY(${currentOffsetY[i]}px);`]" @pointerdown.stop="(e) => start(i, e)"
          >
            <i class="bi-envelope cursor-pointer"></i>
          </div>
        </div>
        <div class="blue h-16 w-56 rounded border-2 relative">
          <div class="absolute bottom-0 left-0 right-0">S</div>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script>
import Panel from './Panel.vue';

const limit = 42
export default {
  name: "AddressPanel",
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
      selected: 0,
      currentOffsetY: Array.from(this.state.streets, () => 0),
      northern: Array.from({ length: 4 }, () => {
        return {
          x: Math.floor(Math.random() * 30) - 15,
          y: -Math.floor(Math.random() * 30)
        }
      }),
      southern: Array.from({ length: 4 }, () => {
        return {
          x: Math.floor(Math.random() * 30) - 15,
          y: Math.floor(Math.random() * 30)
        }
      }),
      dragging: false,
      startY: 0
    }
  },
  methods: {
    sendSolution() {
      this.$emit('submit', {
        north: this.currentOffsetY.map(offset => offset < 0)
      })
    },
    getElement(e) {
      return e.touches ? e.touches[0] : e
    },
    start(i, e) {
      this.selected = i
      const element = this.getElement(e)
      e.preventDefault()
      this.dragging = true
      this.startY = element.clientY - this.currentOffsetY[this.selected]
      document.addEventListener("pointermove", this.drag)
      document.addEventListener("pointerup", this.stop)
    },
    drag(e) {
      const element = this.getElement(e)
      this.currentOffsetY[this.selected] = Math.min(limit, Math.max(-limit, element.clientY - this.startY))
    },
    stop() {
      this.dragging = false
      if (this.currentOffsetY[this.selected] > limit / 2) {
        this.currentOffsetY[this.selected] = limit
      } else if (this.currentOffsetY[this.selected] < -limit / 2) {
        this.currentOffsetY[this.selected] = -limit
      } else {
        this.currentOffsetY[this.selected] = 0
      }
      document.removeEventListener("pointermove", this.drag)
      document.removeEventListener("pointerup", this.stop)
    },
  }
}
</script>

<style scoped>
.red {
  background-color: #ffd5cb;
  color: #ff896b;
  border-color: #ff896b;
}
.blue {
  background-color: #bfe6ff;
  color: #5dc1ff;
  border-color: #5dc1ff;
}
.mail {
  transition: top 0.5s;
}
</style>