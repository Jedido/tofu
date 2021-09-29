<template>
  <div
    :class="[rarity, alignment, 'grid grid-cols-3 gap-1 py-2 rounded h-full']"
  >
    <div class="text-center text-lg col-span-3">
      {{ character.name }}
      <hr class="w-4/5 m-auto" />
    </div>
    <div class="h-full flex flex-col justify-center">
      <img class="w-full" src="../../assets/images/alien.png" />
    </div>
    <div class="col-span-2 pl-1">
      <ul class="description text-sm">
        <li v-for="key of Object.keys(stats)" :key="key">
          {{ key }}: {{ stats[key] }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const RARITY_NAME = ["legendary", "epic", "rare", "common"]
const TYPE_NAME = ["earth", "sea", "sky", "holy"]
const RARITY_STAT_MODIFIER = [1.5, 1.25, 1, 0.75]
const TYPE_BASE_STATS = [
  {
    health: 90,
    mana: 25,
    physical: 30,
    magic: 20,
    armor: 30,
    resistance: 20,
  },
  {
    health: 70,
    mana: 50,
    physical: 20,
    magic: 30,
    armor: 20,
    resistance: 25,
  },
  {
    health: 80,
    mana: 30,
    physical: 25,
    magic: 25,
    armor: 20,
    resistance: 20,
  },
  {
    health: 60,
    mana: 60,
    physical: 10,
    magic: 40,
    armor: 10,
    resistance: 30,
  },
]

export default {
  name: "CharacterCard",
  props: {
    character: {
      type: Object,
      required: true,
      validator: (v) => v.name && v.rarity && v.img && v.type,
    },
  },
  computed: {
    rarity() {
      return RARITY_NAME[this.character.rarity]
    },
    alignment() {
      return TYPE_NAME[this.character.type]
    },
    stats() {
      // randomized stats based on rarity and type lol
      // variance: 0.2
      const stats = { ...TYPE_BASE_STATS[this.character.type] }
      const rarityModifier = RARITY_STAT_MODIFIER[this.character.rarity]
      for (const key of Object.keys(stats)) {
        const variance = Math.random() / 5 + 0.9
        stats[key] = `${Math.round(stats[key] * variance * rarityModifier)} (x${
          Math.round(variance * 100) / 100
        })`
      }
      return stats
    },
  },
}
</script>

<style scoped>
.description {
  color: black;
}
.legendary {
  color: #ffd152;
}
.epic {
  color: #9335ff;
}
.rare {
  color: #41ff7a;
}
.common {
  color: #000000;
}

.legendary hr {
  border-color: #ffd152;
}
.epic hr {
  border-color: #9335ff;
}
.rare hr {
  border-color: #41ff7a;
}
.common hr {
  border-color: #000000;
}

img {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
