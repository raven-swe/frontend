<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import { profileTabsService } from '~/services/profile/profileTabsService';

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
  isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: ['profile', user?.value.username, 'tweets-replies'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await profileTabsService.getProfileTweetsPaginated(
      user?.value.username || '',
      'replies',
      pageParam,
    ),

  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div>
    <ClientOnly>
      <VirtualInfiniteScroller
        v-if="!isBlockedBy"
        :items="tweets"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
        :get-key="(item, index, key) => `${item?.id}-${key || index}`"
      >
        <template #item="{ item }">
          <TweetDefaultCard v-if="item" :tweet="item" />
        </template>
      </VirtualInfiniteScroller>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </ClientOnly>
    <div
      v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-10 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
