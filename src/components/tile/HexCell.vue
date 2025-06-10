<template>
  <div class="relative z-10">
    <div class="w-full h-full flex justify-center items-center" :class="className">
      <template v-if="type > 0 && type < 5">
        <Block class="opacity-50" :top="0" :left="0" :right="0" :bottom="type" color="fade" />
      </template>
      <template v-if="type === 6">
        <i class="bi-brush-fill text-xl gray opacity-50" :color="color"></i>
      </template>
    </div>
  </div>
</template>

<script>
import Block from "./Block.vue"
const tileType = ["floor", "extend-single", "extend-double", "extend-double-r", "extend-double-l", "wall", "paint"]

export default {
  name: "HexCell",
  components: {
    Block
  },
  props: {
    type: Number,
    color: {
      default: "#000000",

    }
  },
  computed: {
    className() {
      return tileType[this.type]
    }
  }
}
</script>
  
<style scoped>
.hex-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.floor {
  background: #ffffff44;
}
.wall {
  background: #000000;
}
.extend-single {
  background: #00000010;
}
.extend-double {
  background: #00000010;
}
.extend-double-r {
  background: #00000010;
}
.extend-double-l {
  background: #00000010;
}
.paint {
  background: #00000010;
}
.gray {
  color: #e0e0e0;
}
.red {
  color: #ff5144;
}
.blue {
  color: #419dff;
}
.yellow {
  color: #ffd152;
}
.green {
  color: #41ff7a;
}
.purple {
  color: #9335ff;
}
.orange {
  color: #ff8c44;
}
</style>