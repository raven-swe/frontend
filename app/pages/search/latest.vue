<script setup lang="ts">
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';
import { useTweetSearch } from '~/composables/tweet/useTweetLists';
import { getItemKey } from '~/constants/query-keys';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';

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
  'latest',
  searchQuery,
  peopleFilter,
  computed(() => searchStore.excludeMutedAndBlocked),
);

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <ClientOnly fallback="span">
      <template #fallback>
        <div class="text-primary mt-20 flex shrink-0 items-center justify-center py-4">
          <UiSpinner />
        </div>
      </template>

      <VirtualInfiniteScroller
        :items="tweets"
        :get-key="getItemKey"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
      >
        <template #item="{ item }">
          <TweetDefaultCard v-if="item" :tweet-id="item.id" :reposter-id="item.reposterId" />
        </template>
      </VirtualInfiniteScroller>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary mt-20 flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
      <div
        v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
        data-testid="empty-state"
        class="mx-auto my-10 max-w-90 px-8 text-start break-words"
      >
        <h2 class="text-[2rem] leading-tight font-black">
          {{ $t('search.no-results', { query: searchQuery }) }}
        </h2>
        <p class="text-muted-foreground leading-tight" data-test="empty-description">
          {{ $t('search.try-searching') }}
        </p>
      </div>
    </ClientOnly>
  </div>
</template>
