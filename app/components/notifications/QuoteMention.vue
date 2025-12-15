<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetDefaultCard from '../tweet/TweetDefaultCard.vue';

const props = defineProps<{
  tweet: Tweet;
}>();
</script>

<!-- This file currently works as a wrapper for the sake of consistency 
and possible future ui updates 
-->
<template>
  <TweetDefaultCard :tweet-id="props.tweet.id" />
</template>
