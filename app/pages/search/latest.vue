<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  watch,
  watchEffect,
  onServerPrefetch,
  type ComponentPublicInstance,
} from 'vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { searchService } from '~/services/search/searchService';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';

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
    'latest',
    searchQuery.value,
    peopleFilter.value,
    searchStore.removeBlocked,
  ]),
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await searchService.getTweets({
      pagination: { limit: 10, cursor: pageParam },
      query: searchQuery.value,
      tab: 'latest',
      peopleFilter: peopleFilter.value,
      removeBlocked: searchStore.removeBlocked,
    }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

// Recalculate offset whenever content changes
watch(
  () => tweets.value.length,
  () => {
    setTimeout(() => {
      if (parentRef.value) {
        parentOffsetRef.value = parentRef.value.offsetTop;
      }
    }, 100);
  },
  { flush: 'post' },
);

const rowVirtualizerOptions = computed(() => {
  return {
    count: hasNextPage ? tweets.value.length + 1 : tweets.value.length,
    estimateSize: () => 120,
    overscan: 3,
    scrollMargin: parentOffsetRef.value,
    getItemKey: (index: number) => tweets.value[index]?.id || index,
  };
});

const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const measureElement = (el: Element | ComponentPublicInstance | null) => {
  if (!el) return;
  const element = 'nodeType' in el ? (el as HTMLElement) : (el as ComponentPublicInstance).$el;
  rowVirtualizer.value.measureElement(element);
};

watchEffect(() => {
  const [lastItem] = [...virtualRows.value].reverse();

  if (!lastItem) {
    return;
  }

  if (lastItem.index >= tweets.value.length - 3 && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <div
      v-if="tweets.length === 0 && !isLoading"
      class="mx-auto my-10 max-w-90 px-8 text-start break-words"
    >
      <p class="text-[2rem] leading-tight font-black">
        {{ $t('search.no-results', { query: searchQuery }) }}
      </p>
      <p class="text-muted-foreground mt-1 leading-tight">
        {{ $t('search.try-searching') }}
      </p>
    </div>

    <!-- Tweets Section -->
    <div ref="parentRef" class="border-border mx-auto max-w-[700px]">
      <ClientOnly>
        <div v-if="tweets">
          <div
            :style="{
              height: `${totalSize}px`,
              width: '100%',
              position: 'relative',
            }"
          >
            <div
              :style="{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${
                  virtualRows[0] ? virtualRows[0].start - rowVirtualizer.options.scrollMargin : 0
                }px)`,
              }"
            >
              <div
                v-for="virtualRow in virtualRows"
                :key="tweets[virtualRow.index]?.id || String(virtualRow.key)"
                :ref="measureElement"
                :data-index="virtualRow.index"
              >
                <TweetDefaultCard
                  v-if="tweets[virtualRow.index]"
                  :tweet="tweets[virtualRow.index]!"
                />
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary mt-20 flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </div>
  </div>
</template>
