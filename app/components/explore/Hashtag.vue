<script lang="ts" setup>
import type { TrendingHashtag } from '~~/shared/types/hashtag';

const props = defineProps<{
  hashtag: TrendingHashtag;
}>();
</script>

<template>
  <div class="hover:bg-accent flex cursor-pointer flex-col gap-1 p-4 font-bold">
    <p class="text-xs text-gray-500">{{ $t('Trending in Egypt') }}</p>
    <p class="text-sm">{{ props.hashtag.hashtag }}</p>
    <p class="text-xs text-gray-500">{{ $n(props.hashtag.tweetsCount) }} {{ $t('posts') }}</p>
  </div>
</template>
