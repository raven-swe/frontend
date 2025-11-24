<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
definePageMeta({
  layout: 'profile',
});

const user = inject<ComputedRef<User>>('user-data');
const isBlockedBy = computed(() => user?.value.relationship.blockedBy || false);

const tweets = ref<Tweet[]>([]);

const { data: tweetsData, error } = await useFetch<{ data: Tweet[] }>('/api/tweets');
tweets.value = tweetsData.value?.data || [];

if (error.value) console.error(error.value);
</script>

<template>
  <div>
    <div v-if="isBlockedBy" class="border-b-1 p-8">
      <h1 class="text-2xl font-semibold">
        {{ $t('profile.messages.blocked-by.title', { username: user?.username || '' }) }}
      </h1>
      <p class="text-muted-foreground">
        {{ $t('profile.messages.blocked-by.description', { username: user?.username || '' }) }}
      </p>
    </div>
    <div v-if="tweets.length > 0" class="mb-4">
      <div class="mt-4 flex w-full max-w-[700px] flex-col gap-4">
        <TweetDefaultCard v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
      </div>
    </div>
    <div v-else data-testid="empty-state" class="text-muted-foreground mt-10 text-center">
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
