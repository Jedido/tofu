<template>
  <div class="h-3 w-3 relative">
    <div v-if="draggable" class="pin" :class="color"></div>
    <div class="h-3 w-3 square" :class="`${draggable ? `black` : color}`"></div>
  </div>
</template>

<script>
  export default {
    name: "Square",
    props: {
      color: {
        type: String,
        default: "gray"
      },
      draggable: {
        type: Boolean,
        default: false
      }
    }
  }
</script>
  
<style scoped>
.square { 
  border-radius: 2px;
}
.square:not(.fade) {
  box-shadow: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.4), inset -1px -1px 0px 0px rgba(0, 0, 0, 0.4);
}
.black {
  background-color: #606060;
}
.pin {
  width: 4px;
  height: 4px;
  position: absolute;
  top: 4px;
  left: 4px;
  border-radius: 2px;
  box-shadow: inset 1px 1px 0px 0px rgba(0, 0, 0, 0.2);
}
.gray {
  background-color: #e0e0e0;
}
.red {
  background-color: #ff5144;
}
.blue {
  background-color: #419dff;
}
.yellow {
  background-color: #ffd152;
}
.green {
  background-color: #41ff7a;
}
.purple {
  background-color: #9335ff;
}
.orange {
  background-color: #ff8c44;
}
.fade {
  background-color: #ffffff66;
  border: 1px dashed #ffffff;
  box-sizing: border-box;
}
</style>