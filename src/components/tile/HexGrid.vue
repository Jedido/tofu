<template>
  <div class="hex-grid relative">
    <HexCell class="hex" v-for="(type, i) in grid" :key="i" :type="type" />
    <PlayerUnit
      v-for="unit in units"
      :key="unit.id"
      :id="unit.id"
      :position="unit.position"
      :top="unit.block.top"
      :left="unit.block.left"
      :right="unit.block.right"
      :bottom="unit.block.bottom"
      :color="unit.block.color"
      @move="handleMove"
      @pointerdown="handlePointerDown(unit.id)"
      :movable="mode === 'move'"
      :drop="unit.drop"
    />
  </div>
</template>
  
<script>
import HexCell from './HexCell.vue';
import PlayerUnit from './PlayerUnit.vue';

export default {
  name: "HexGrid",
  components: {
    HexCell,
    PlayerUnit
  },
  props: {
    grid: Array,
    units: Array,
    mode: String
  },
  methods: {
    handleMove(move) {
      this.$emit("move", move)
    },
    handlePointerDown(id) {
      this.$emit("use-control", { unit: id })
    }
  }
}
</script>
  
<style scoped>
.hex-grid {
  display: flex;
  flex-wrap: wrap;
  --s: 50px;
  --m: 0px;
  width: calc(var(--s) * 7.5 + var(--m) * 15);
  padding-bottom: calc(var(--s) / 4 * 1.1547);
}

.hex {
  width: var(--s);
  margin: var(--m);
  height: calc(var(--s)*1.1547); 
  text-align: center;
  clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  margin-bottom: calc(var(--m) - var(--s) * 0.2886);
}

.hex:nth-child(14n + 1) {
  margin-left: calc(var(--s) / 2 + var(--m) * 2);
}
</style>