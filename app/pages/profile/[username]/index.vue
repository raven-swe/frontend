<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
definePageMeta({
  layout: 'profile',
});

const user = inject<ComputedRef<User>>('user-data');
const isBlockedBy = computed(() => user?.value.relationship.blockedBy || false);
const { data: response, suspense } = useQuery({
  queryKey: ['profile', user?.value.username, 'tweets'],
  queryFn: async () =>
    await apiFetch(`/api/users/${user?.value.username}/tweets`, {
      method: 'GET',
    }),
});
const tweets = computed(() => response.value?.data || []);
onServerPrefetch(async () => {
  await suspense();
});
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
