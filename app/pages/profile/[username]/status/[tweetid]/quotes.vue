<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import { tweetsService } from '~/services/tweet/tweetsService';

definePageMeta({
  layout: 'tweet-engagement',
});

const tweet = inject<ComputedRef<TweetWithParents>>('tweet-data');

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: ['tweet', tweet?.value.id, 'quotes'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await tweetsService.quotes({
      tweetid: tweet?.value.id || '',
      cursor: pageParam,
    }),

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
        :items="tweets"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
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
    <div v-if="!isLoading && tweets.length === 0" class="mx-auto my-10 max-w-90 px-8 text-start">
      <h2 class="text-[2rem] leading-tight font-black">
        {{ $t('tweet.engagement.quotes.empty.title') }}
      </h2>
      <p class="text-muted-foreground leading-tight">
        {{ $t('tweet.engagement.quotes.empty.description') }}
      </p>
    </div>
  </div>
</template>
