<script lang="ts" setup>
defineProps<{
  coverImg: string;
}>();
</script>
<template>
  <NuxtImg :src="coverImg" alt="Profile Cover" class="h-48 w-full object-cover" loading="eager" />
</template>
