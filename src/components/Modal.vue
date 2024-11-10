<template>
  <div class="absolute top-0 left-0 bottom-0 right-0 z-50">
    <div class="w-full h-full bg-gray-900 opacity-25" @click="$emit('dismiss')">
    </div>
    <div class="absolute bg-white text-gray-900 pt-2 pb-4 px-5 left-0 right-0 mx-auto w-fit top-1/2 -translate-y-2/4">
      <i class="bi-x text-error text-2xl absolute right-0 -top-1 p-2" @click="$emit('dismiss')"></i>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal"
}
</script>
