<template>
  <div id="sandbox" class="select-none text-gray-700">
    <h2 class="text-2xl text-center">Sandbox</h2>    
    <template v-if="mode === 'zoom'">
      <div class="text-2xl bg-white mx-6 h-100 p-3 mb-3">
        <div class="h-full flex justify-center">
          <ZoomImage
            v-show="image"
            :image="image"
            :x="x"
            :y="y"
            :scale="scale"
            :time="time"
            :state="state"
          />
        </div>
      </div>
      <div class="grid grid-cols-6 gap-2">
        <label class="col-span-1 text-right">image: </label>
        <input
          v-model="image"
          type="text"
          class="col-span-5 outline-none w-full rounded px-2 shadow"
        />
        <label class="col-span-1 text-right">x: {{ parseFloat(x).toFixed(2) }}</label>
        <input
          v-model="x"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="slider col-span-2"
        />
        <label class="col-span-1 text-right">y: {{ parseFloat(y).toFixed(2) }}</label>
        <input
          v-model="y"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="slider col-span-2"
        />
        <label class="col-span-1 text-right">scale: {{ parseFloat(scale).toFixed(2) }}x</label>
        <input
          v-model="scale"
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          class="slider col-span-2"
        />
        <label class="col-span-1 text-right">time: {{ time }}s</label>
        <input
          v-model="time"
          type="range"
          min="0"
          max="30"
          step="1"
          class="slider col-span-2"
        />
      </div>
      <div class="text-emerald-50 flex gap-2">
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'active'">Start</button>
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'full'">Reveal</button>
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'start'">Reset</button>
      </div>
    </template>
    <template v-else-if="mode === 'blur'">
      <div class="text-2xl bg-white mx-6 h-100 p-3 mb-3">
        <div class="h-full flex justify-center">
          <BlurImage
            v-show="image"
            :image="image"
            :blur="blur"
            :time="time"
            :state="state"
          />
        </div>
      </div>
      <div class="grid grid-cols-6 gap-2">
        <label class="col-span-1 text-right">image: </label>
        <input
          v-model="image"
          type="text"
          class="col-span-5 outline-none w-full rounded px-2 shadow"
        />
        <label class="col-span-1 text-right">blur: {{ blur }}px</label>
        <input
          v-model="blur"
          type="range"
          min="1"
          max="50"
          step="1"
          class="slider col-span-2"
        />
        <label class="col-span-1 text-right">time: {{ time }}s</label>
        <input
          v-model="time"
          type="range"
          min="0"
          max="30"
          step="1"
          class="slider col-span-2"
        />
      </div>
      <div class="text-emerald-50 flex gap-2">
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'active'">Start</button>
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'full'">Reveal</button>
        <button class="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-800 rounded" @click="state = 'start'">Reset</button>
      </div>
    </template>
    <select v-model="mode" class="border bg-white p-2 text-center w-full mt-2">
      <option value="blur">Blur</option>
      <option value="zoom">Zoom</option>
    </select>
  </div>
</template>

<script>
import ZoomImage from "../jeopardy/ZoomImage.vue";
import BlurImage from "../jeopardy/BlurImage.vue";

export default {
  name: "SandboxGame",
  components: {
    ZoomImage,
    BlurImage
  },
  data() {
    return {
      mode: 'blur',
      image: 'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg',
      blur: 10,
      x: 0.5,
      y: 0.5,
      scale: 0.1,
      time: 10,
      state: 'start'
    }
  }
}
</script>

<style scoped>
.slider {
  margin-top: 8px;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #f3f4f6;
  border: 1px solid #9ca3af;
  outline: none;
  transition: background-color 0.2s;
}

.slider:hover {
  background: #e5e7eb;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

.h-100 {
  height: 24rem;
}

@media (max-width: 768px) {
  .h-100 {
    height: 16rem;
  }
}
</style>