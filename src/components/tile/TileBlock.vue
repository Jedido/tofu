<template>
  <div
    class="grid h-min w-min"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <template v-if="color !== 'fade'">
      <TileSquare
        class="col-span-1 row-span-1 row-start-3 col-start-3"
        :color="color"
        :draggable="draggable"
      />
    </template>
    <template v-else>
      <div
        class="col-span-1 row-span-1 row-start-3 col-start-3 h-3 w-3 relative"
      >
        <i
          class="bi-arrow-bar-up text-gray-200 absolute left-1/2 -translate-x-1/2 text-xs"
        ></i>
      </div>
    </template>
    <TileSquare
      v-if="bottom"
      class="col-span-1 row-span-1 row-start-4 col-start-3"
      :color="color"
    />
    <TileSquare
      v-if="top"
      class="col-span-1 row-span-1 row-start-2 col-start-3"
      :color="color"
    />
    <TileSquare
      v-if="right"
      class="col-span-1 row-span-1 row-start-3 col-start-4"
      :color="color"
    />
    <TileSquare
      v-if="left"
      class="col-span-1 row-span-1 row-start-3 col-start-2"
      :color="color"
    />
    <TileSquare
      v-if="bottom === 2"
      class="col-span-1 row-span-1 row-start-5 col-start-3"
      :color="color"
    />
    <TileSquare
      v-if="right === 2"
      class="col-span-1 row-span-1 row-start-3 col-start-5"
      :color="color"
    />
    <TileSquare
      v-if="top === 2"
      class="col-span-1 row-span-1 row-start-1 col-start-3"
      :color="color"
    />
    <TileSquare
      v-if="left === 2"
      class="col-span-1 row-span-1 row-start-3 col-start-1"
      :color="color"
    />
    <TileSquare
      v-if="top === 3 || right === 4"
      class="col-span-1 row-span-1 row-start-2 col-start-4"
      :color="color"
    />
    <TileSquare
      v-if="right === 3 || bottom === 4"
      class="col-span-1 row-span-1 row-start-4 col-start-4"
      :color="color"
    />
    <TileSquare
      v-if="left === 3 || top === 4"
      class="col-span-1 row-span-1 row-start-2 col-start-2"
      :color="color"
    />
    <TileSquare
      v-if="bottom === 3 || left === 4"
      class="col-span-1 row-span-1 row-start-4 col-start-2"
      :color="color"
    />
  </div>
</template>

<script>
import TileSquare from "@/components/tile/TileSquare.vue"

export default {
  name: "TileBlock",
  components: {
    TileSquare,
  },
  props: {
    top: { type: Number, required: true },
    left: { type: Number, required: true },
    right: { type: Number, required: true },
    bottom: { type: Number, required: true },
    orientation: { type: Number, required: true },
    draggable: {
      type: Boolean,
      default: false,
    },
    color: { type: String, required: true },
  },
  computed: {
    rotation() {
      return this.orientation * 90
    },
  },
}
</script>

<style scoped></style>
