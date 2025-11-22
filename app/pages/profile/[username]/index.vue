<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import { useInfiniteScroll } from '@vueuse/core';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';

definePageMeta({
  layout: 'profile',
});

const user = inject<ComputedRef<User>>('user-data');
const isBlockedBy = computed(() => user?.value.relationship.blockedBy || false);

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  suspense,
} = useInfiniteQuery({
  queryKey: ['profile', user?.value.username, 'tweets'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) => {
    const params: Record<string, string> = { limit: DEFAULT_PAGE_SIZE.toString() };
    if (pageParam) params.cursor = pageParam;

    const res = await apiFetch(`/api/users/${user?.value.username}/tweets`, {
      method: 'GET',
      params,
    });

    return res;
  },

  getNextPageParam: (lastPage) => {
    return lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined;
  },
});

const tweets = computed(() => {
  return response.value?.pages.flatMap((page) => page.data) || [];
});

const sentinel = ref<HTMLElement | null>(null);
useInfiniteScroll(
  sentinel,
  async () => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      await fetchNextPage();
    }
  },
  { distance: 1000 },
);

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

      <!-- sentinel element for infinite scroll -->
      <div ref="sentinel" class="h-4"></div>
      <div
        v-if="hasNextPage && isFetchingNextPage"
        class="text-primary flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </div>
    <div v-else data-testid="empty-state" class="text-muted-foreground mt-10 text-center">
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
