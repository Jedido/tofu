<template>
  <div class="fixed top-0 left-0 bottom-0 right-0 z-50">
    <div class="w-full h-full bg-gray-900 opacity-25" @click.stop="$emit('dismiss')">
    </div>
    <div class="absolute bg-white text-gray-900 pt-2 pb-4 px-5 left-0 right-0 mx-auto w-fit top-1/2 -translate-y-2/4">
      <i class="bi-x text-error text-2xl absolute right-0 top-0 px-2 py-1 cursor-pointer" @click.prevent="$emit('dismiss')"></i>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal"
}
</script>
