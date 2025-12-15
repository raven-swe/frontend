<script lang="ts" setup>
import type { TrendingHashtag } from '~~/shared/types/hashtag';

const props = defineProps<{
  hashtag: TrendingHashtag;
  rank: number;
}>();

const handleClick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <NuxtLink
    :to="`/search/top?q=${encodeURIComponent(props.hashtag.hashtag)}`"
    class="hover:bg-accent flex cursor-pointer flex-col gap-1 px-4 py-2"
    data-cy="explore-hashtag-item"
    @click="handleClick"
  >
    <p class="text-muted-foreground text-xs font-semibold" data-cy="explore-hashtag-trending-in">
      {{
        $t('explore.hashtag', {
          category: props.hashtag.category,
          rank: props.rank + 1,
        })
      }}
    </p>
    <p class="text-sm font-bold" data-cy="explore-hashtag-text">{{ props.hashtag.hashtag }}</p>
    <p class="text-muted-foreground text-xs font-semibold" data-cy="explore-hashtag-nposts">
      {{ $n(props.hashtag.tweetsCount, { notation: 'compact' }) }} {{ $t('posts') }}
    </p>
  </NuxtLink>
</template>
