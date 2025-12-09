<script lang="ts" setup>
import DeletedTweetPlaceholder from '@/components/tweet/DeletedTweetPlaceholder.vue';
import { isTweetDeleted } from '~/utils/tweetDeleted';

defineProps<{
  tweet: Tweet | DeletedTweet;
}>();
</script>
<template>
  <TweetQuoteCard v-if="!isTweetDeleted(tweet)" :tweet="tweet" />
  <DeletedTweetPlaceholder v-else class="mt-2" />
</template>
