<script setup lang="ts">
import { onMounted, computed, watch, onServerPrefetch } from 'vue';
import { searchService } from '~/services/search/searchService';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import Thumbnail from '~/components/ui/Thumbnail.vue';

definePageMeta({
  layout: 'search',
});

const { searchQuery, initializeFromRoute } = useSearchQuery();
const route = useRoute();
const searchStore = useSearchStore();

// Compute people filter from URL
const peopleFilter = computed(() =>
  route.query.pf === 'on' ? PeopleFilter.following : PeopleFilter.anyone,
);

// Initialize search query from URL
onMounted(() => {
  initializeFromRoute();
});

// Watch for route query changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  },
);

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching: isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: computed(() => [
    'search',
    'tweets',
    'media',
    searchQuery.value,
    peopleFilter.value,
    searchStore.excludeMutedAndBlocked,
  ]),
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await searchService.getTweets({
      pagination: { limit: 10, cursor: pageParam },
      query: searchQuery.value,
      tab: 'media',
      peopleFilter: peopleFilter.value,
      excludeMutedAndBlocked: searchStore.excludeMutedAndBlocked,
    }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
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

        <div
          v-if="(hasNextPage && isFetchingNextPage) || isLoading"
          class="text-primary flex shrink-0 items-center justify-center py-4"
        >
          <UiSpinner />
        </div>
      </ClientOnly>
    </div>
    <div v-if="!isLoading && tweets.length === 0" class="mx-auto my-10 max-w-90 px-8 text-start">
      <p class="text-[2rem] leading-tight font-black">
        {{ $t('search.no-results', { query: searchQuery }) }}
      </p>
      <p class="text-muted-foreground leading-tight">
        {{ $t('search.try-searching') }}
      </p>
    </div>
  </div>
</template>
