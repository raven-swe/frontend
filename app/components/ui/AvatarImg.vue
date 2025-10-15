<script setup lang="ts">
defineProps<{
  src: string;
  alt?: string;
  class?: string;
}>();
</script>

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    sizes="100px"
    format="webp"
    quality="80"
    class="aspect-square h-full w-full rounded-full object-cover"
  />
</template>
