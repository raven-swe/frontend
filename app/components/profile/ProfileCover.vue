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
    class="aspect-[3/1] w-full object-cover"
    loading="eager"
    data-cy="profile-cover-image"
  />
  <div v-else class="bg-muted-foreground/30 flex aspect-[3/1] w-full"></div>
</template>
