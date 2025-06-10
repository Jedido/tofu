<template>
  <div class="grid h-min w-min" :style="{ transform: `rotate(${rotation}deg)` }">
    <template v-if="color !== 'fade'">
      <Square class="col-span-1 row-span-1 row-start-3 col-start-3" :color="color" :draggable="draggable" />
    </template>
    <template v-else>
      <div class="col-span-1 row-span-1 row-start-3 col-start-3 h-3 w-3 relative">
        <i class="bi-arrow-bar-up text-gray-200 absolute left-1/2 -translate-x-1/2 text-xs"></i>
      </div>
    </template>
    <Square class="col-span-1 row-span-1 row-start-4 col-start-3" v-if="bottom" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-2 col-start-3" v-if="top" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-3 col-start-4" v-if="right" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-3 col-start-2" v-if="left" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-5 col-start-3" v-if="bottom === 2" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-3 col-start-5" v-if="right === 2" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-1 col-start-3" v-if="top === 2" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-3 col-start-1" v-if="left === 2" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-2 col-start-4" v-if="top === 3 || right === 4" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-4 col-start-4" v-if="right === 3 || bottom === 4" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-2 col-start-2" v-if="left === 3 || top === 4" :color="color" />
    <Square class="col-span-1 row-span-1 row-start-4 col-start-2" v-if="bottom === 3 || left === 4" :color="color" />
  </div>
</template>

<script>
import Square from "./Square.vue"

export default {
  name: "Block",
  components: {
    Square
  },
  props: {
    top: Number,
    left: Number,
    right: Number,
    bottom: Number,
    orientation: Number,
    draggable: {
      type: Boolean,
      default: false
    },
    color: String,
  },
  computed: {
    rotation() {
      return this.orientation * 90;
    }
  }
}
</script>
  
<style scoped>
</style>