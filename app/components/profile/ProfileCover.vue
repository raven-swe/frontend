<script lang="ts" setup>
defineProps<{
  coverImg: string;
}>();
</script>
<template>
  <NuxtImg
    v-if="coverImg"
    :src="coverImg"
    alt="Profile Cover"
    class="h-48 w-full object-cover"
    loading="eager"
    data-cy="profile-cover-image"
  />
  <div v-else class="bg-muted-foreground/30 flex h-48 w-full"></div>
</template>
