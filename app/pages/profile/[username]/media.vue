<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import Thumbnail from '~/components/ui/Thumbnail.vue';
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
      'media',
      pageParam,
    ),

  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
});

const tweets = computed(() => {
  const flat = response.value?.pages.flatMap((page) => page.data) || [];
  const chunked = [];
  for (let i = 0; i < flat.length; i += 3) {
    chunked.push(flat.slice(i, i + 3));
  }
  return chunked;
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div>
    <div class="px-1">
      <ClientOnly>
        <VirtualInfiniteScroller
          v-if="!isBlockedBy"
          :items="tweets"
          :has-next-page="hasNextPage"
          :is-fetching-next-page="isFetchingNextPage"
          :fetch-next-page="fetchNextPage"
        >
          <template #item="{ item }">
            <div class="grid grid-cols-3 gap-1 overflow-hidden pt-1">
              <!-- Always delegate media rendering to Thumbnail -->
              <NuxtLink
                v-for="tweet in item"
                :key="tweet.id"
                :to="`/profile/${tweet.author.username}/status/${tweet.id}`"
                class="block size-full"
              >
                <Thumbnail :media="tweet.media?.[0]" :multiple="tweet.media?.length > 1" />
              </NuxtLink>
            </div>
          </template>
        </VirtualInfiniteScroller>
      </ClientOnly>
    </div>

    <div
      v-if="(hasNextPage && isFetchingNextPage) || isLoading"
      class="text-primary flex shrink-0 items-center justify-center py-4"
    >
      <UiSpinner />
    </div>
    <div
      v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-10 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
