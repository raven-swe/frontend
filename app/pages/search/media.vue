<script setup lang="ts">
import { computed, watch, onServerPrefetch } from 'vue';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import { useTweetSearch } from '~/composables/tweet/useTweetLists';
import { getItemKey } from '~/constants/query-keys';

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
initializeFromRoute();

// Watch for route query changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  },
  { immediate: true },
);

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching: isLoading,
  suspense,
} = useTweetSearch(
  'media',
  searchQuery,
  peopleFilter,
  computed(() => searchStore.excludeMutedAndBlocked),
);

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
          :get-key="
            (item, index, key) =>
              `${item?.map((tweet) => getItemKey(tweet, index)).join('-') ?? key}`
          "
        >
          <template #item="{ item }">
            <div class="grid grid-cols-3 gap-1 overflow-hidden pt-1">
              <TweetMediaThumbnail
                v-for="(tweet, index) in item"
                :key="index"
                :tweet-id="tweet.id"
              />
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
    <div
      v-if="!isLoading && tweets.length === 0"
      class="mx-auto my-10 max-w-90 px-8 text-start break-words"
      data-test="no-results"
    >
      <h2 class="text-[2rem] leading-tight font-black">
        {{ $t('search.no-results', { query: searchQuery }) }}
      </h2>
      <p class="text-muted-foreground mt-1 leading-tight">
        {{ $t('search.try-searching') }}
      </p>
    </div>
  </div>
</template>
