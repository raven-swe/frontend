<script lang="ts" setup>
const props = defineProps<{
  hashtag: string;
}>();
</script>

<template>
  <NuxtLink
    :to="`/search/top?q=${encodeURIComponent(props.hashtag)}`"
    class="hover:bg-accent block cursor-pointer p-4"
  >
    <div class="flex gap-1">
      <div>
        <Icon size="20" name="ic:outline-search" class="text-muted-foreground" />
      </div>
      <div>
        <p class="text-sm font-bold">{{ props.hashtag }}</p>
        <p class="text-muted-foreground text-xs">{{ $t('explore.trending.tab') }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
