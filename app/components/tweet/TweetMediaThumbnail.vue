<script lang="ts" setup>
import { useTweet } from '~/composables/tweet/useTweet';
import Thumbnail from '@/components/ui/Thumbnail.vue';

const props = defineProps<{
  tweetId: string;
}>();

const { data: tweet } = useTweet(computed(() => props.tweetId));
</script>

<template>
  <NuxtLink v-if="tweet" :to="`/media/${tweet.id}`" class="block size-full">
    <Thumbnail :media="tweet.media?.[0]" :multiple="tweet.media?.length > 1" />
  </NuxtLink>
</template>
