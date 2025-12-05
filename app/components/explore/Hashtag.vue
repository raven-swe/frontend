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
    class="hover:bg-accent flex cursor-pointer flex-col gap-1 px-4 py-2"
    @click="handleClick"
  >
    <p class="text-muted-foreground text-xs font-semibold">
      {{
        $t('explore.hashtag', {
          location: props.hashtag.country ? props.hashtag.country : props.hashtag.interest,
          rank: props.hashtag.rank,
        })
      }}
    </p>
    <p class="text-sm font-bold">{{ props.hashtag.hashtag }}</p>
    <p class="text-muted-foreground text-xs font-semibold">
      {{ $n(props.hashtag.tweetsCount) }} {{ $t('posts') }}
    </p>
  </NuxtLink>
</template>
