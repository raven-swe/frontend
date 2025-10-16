<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  src: string;
  alt?: string;
  class?: string;
}>();
const error = ref(false);

function onError() {
  error.value = true;
}

// Reset error if src changes
watch(
  () => props.src,
  () => {
    error.value = false;
  },
);
</script>

<template>
  <NuxtImg
    v-if="!error"
    :src="src"
    :alt="alt"
    sizes="100px"
    format="webp"
    quality="80"
    class="aspect-square h-full w-full rounded-full object-cover"
    @error="onError"
  />
</template>
