<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetDefaultCard from '../../components/tweet/TweetDefaultCard.vue';
const tweets = ref<Tweet[]>([]);

const { data: tweetsData, error } = await useFetch<{ data: Tweet[] }>('/api/tweets');
tweets.value = tweetsData.value?.data || [];

if (error.value) console.error(error.value);
</script>

<template>
  <div class="p-4">
    <div v-if="tweets.length > 0" class="mb-4">
      {{ $t('testing.tweets.tweets-list') }}
      <div class="mt-4 flex w-full max-w-[700px] flex-col gap-4">
        <TweetDefaultCard v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
      </div>
    </div>
    <h1 v-else>{{ $t('testing.tweets.tweet-not-found') }}</h1>
  </div>
</template>
