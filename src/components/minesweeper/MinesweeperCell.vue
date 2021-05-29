<template>
  <div
    :key="index"
    :class="type"
    :style="{ color: `${color}` }"
    @click="revealSpace()"
  >
    <Mine v-if="value === mine" />
    <Explosion v-else-if="value === explosion" />
    <Flag v-else-if="value === flag" />
    {{ color ? value : '' }}
  </div>
</template>

<script>
import Flag from '../../img/flag.svg'
import Explosion from '../../img/explosion.svg'
import Mine from '../../img/mine.svg'

export default {
  name: 'AnagramGame',
  components: {
    Flag,
    Explosion,
    Mine
  },
  props: {
    value: Number,
    active: Boolean
  },
  data() {
    return {
      mine: -10,
      flag: -20,
      hidden: -30,
      blank: -40,
      explosion: -50,
      colors: ['blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray']
    }
  },
  methods: {
    revealSpace() {
      if (this.value === this.hidden) {
        this.$emit('revealSpace')
      }
    }
  },
  computed: {
    type() {
      switch (this.value) {
        case this.hidden:
          return 'hidden'
        case this.flag:
          return 'flag'
        case this.mine:
          return 'bomb'
        case this.explosion:
          return ''
      }
      return 'normal'
    },
    color() {
      if (this.value > 0 && this.value < 9) {
        return this.colors[this.value - 1]
      }
      return ''
    }
  }
}
</script>
