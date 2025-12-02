<script lang="ts" setup>
import type { TrendingHashtag } from '~~/shared/types/hashtag';

const props = defineProps<{
  hashtag: TrendingHashtag;
}>();

const handleClick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <NuxtLink
    :to="`/search/top?q=${encodeURIComponent('#' + props.hashtag.hashtag)}`"
    class="hover:bg-accent flex cursor-pointer flex-col gap-1 p-4 font-bold"
    @click="handleClick"
  >
    <p class="text-xs text-gray-500">{{ $t('Trending in Egypt') }}</p>
    <p class="text-sm">{{ props.hashtag.hashtag }}</p>
    <p class="text-xs text-gray-500">{{ $n(props.hashtag.tweetsCount) }} {{ $t('posts') }}</p>
  </NuxtLink>
</template>
