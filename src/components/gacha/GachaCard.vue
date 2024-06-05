<template>
  <div class="rounded card m-8 bg-white">
    <div v-if="typeof character === 'object'" class="relative">
      <CharacterCard :character="character" class="card absolute border-4" />
      <div
        v-if="!revealed"
        @click="revealed = true"
        :class="['card absolute reveal rounded border-4', type]"
      />
    </div>
    <button
      v-if="typeof character === 'number'"
      @click="reveal"
      :class="[type, 'py-2 w-full h-full rounded focus:outline-none shadow-lg']"
    ></button>
  </div>
</template>

<script>
import CharacterCard from "./CharacterCard.vue"

const TYPE_NAME = ["earth-back", "sea-back", "sky-back", "holy-back"]

export default {
  name: "GachaCard",
  components: {
    CharacterCard,
  },
  props: {
    character: [Object, Number],
  },
  data() {
    return {
      type: TYPE_NAME[this.character],
      revealed: false,
    }
  },
  methods: {
    reveal() {
      this.$emit("recruit")
    },
  },
}
</script>

<style scoped>
.legendary {
  box-shadow: 0px 0px 40px 40px #ffd152;
  animation: big-glow 2s ease-in-out;
}
.epic {
  box-shadow: 0px 0px 20px 20px #9335ff;
  animation: medium-glow 2s ease-in-out;
}
.rare {
  box-shadow: 0px 0px 10px 10px #41ff7a;
  animation: small-glow 2s ease-in-out;
}
.common {
  box-shadow: 0px 0px 10px 10px white;
}
@keyframes big-glow {
  0% {
    box-shadow: 0px 0px 40px 40px;
  }
  50% {
    box-shadow: 0px 0px 30px 30px;
  }
  100% {
    box-shadow: 0px 0px 40px 40px;
  }
}
@keyframes medium-glow {
  0% {
    box-shadow: 0px 0px 30px 30px;
  }
  50% {
    box-shadow: 0px 0px 20px 20px;
  }
  100% {
    box-shadow: 0px 0px 30px 30px;
  }
}
@keyframes small-glow {
  0% {
    box-shadow: 0px 0px 20px 20px;
  }
  50% {
    box-shadow: 0px 0px 10px 10px;
  }
  100% {
    box-shadow: 0px 0px 20px 20px;
  }
}
.card {
  height: 180px;
  width: 240px;
  background-size: auto;
  border-color: black;
  animation-iteration-count: infinite;
}
.sea-back {
  background: url("@/assets/images/heart.png") no-repeat center;
}
.sky-back {
  background: url("@/assets/images/club.png") no-repeat center;
}
.earth-back {
  background: url("@/assets/images/spade.png") no-repeat center;
}
.holy-back {
  background: url("@/assets/images/diamond.png") no-repeat center;
}
</style>
