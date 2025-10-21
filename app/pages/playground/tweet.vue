<script setup lang="ts">
import type { Tweet } from '~~/types/tweets';
const tweets = ref<Tweet[]>([]);

const { data: tweetsData, error } = useFetch<{ data: Tweet[] }>('/api/tweets');
tweets.value = tweetsData.value?.data || [];

if (error.value) console.error(error.value);
</script>

<template>
  <div class="p-4">
    <h1 v-if="tweets[1]" class="mb-4 text-2xl font-bold">
      {{ tweets[1].id }}
    </h1>
    <h1 v-else>{{ $t('testing.tweets.tweet-not-found') }}</h1>
  </div>
</template>
