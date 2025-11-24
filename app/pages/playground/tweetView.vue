<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetView from '../../components/tweet/TweetView.vue';
const tweets = ref<Tweet[]>([]);

const { data: tweetsData, error } = await useFetch<{ data: Tweet[] }>('/api/tweets');
tweets.value = tweetsData.value?.data || [];

if (error.value) console.error(error.value);
</script>

<template>
  <div class="p-4">
    <div>
      <button class="cursor-pointer" @click="$router.back()">
        <Icon :name="$t('icons.back-button-icon')" size="1.3rem" />
        <span class="ps-8 text-xl font-bold">{{ $t('ui.post') }}</span>
      </button>
    </div>
    <div class="mt-4 flex w-full max-w-[700px] flex-col gap-4">
      <TweetView :key="tweets[8].id" :tweet="tweets[8]" />
    </div>
    <div class="text-muted-foreground border-b-border mt-8 h-12 border-b-1 text-center">
      {{ $t('Post your reply') }}
    </div>
    <TweetDefaultCard
      v-for="tweet in tweets"
      :key="(tweet as Tweet)?.data?.id ?? (tweet as Tweet)?.id"
      :tweet="(tweet as Tweet)?.data ?? (tweet as Tweet)"
    />
  </div>
</template>
