<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetDefaultCard from '@/components/tweet/TweetDefaultCard.vue';
const route = useRoute();
definePageMeta({
  layout: 'profile',
});

const tweets = ref<Tweet[]>([]);

const { data: tweetsData, error } = await useFetch<{ data: Tweet[] }>('/api/tweets');
tweets.value = tweetsData.value?.data || [];

if (error.value) console.error(error.value);
const username = computed(() => route.params.username);

// reactivity for profiles of mine & other users
onMounted(() => {
  if (!useUserStore().user.username || useUserStore().user.username !== username.value)
    useUserStore().fetchUserProfile(username.value as string);
});
</script>

<template>
  <div class="p-2">
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
