<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { homeService } from '~/services/home/homeService';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';

function isTab(value: unknown): value is HomeTab {
  return typeof value === 'string' && validHomeTabs.includes(value as HomeTab);
}

definePageMeta({
  layout: 'home',
  validate: (context) => isTab(context.params.tab),
});

const route = useRoute();
const tab = computed(() => route.params.tab as HomeTab);

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: [tab.value],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await homeService.getHomeTab({ limit: 10, cursor: pageParam }, tab.value),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);
onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0;
});

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

const queryClient = useQueryClient();

function handlePost(tweet: Tweet) {
  // Optimistically add the new tweet to the top of the list
  if (!tab.value) return;
  queryClient.setQueryData<{
    pages: Array<{ data: Tweet[]; pagination?: CursorPagination }>;
    pageParams: Array<string | null>;
  }>([tab.value], (oldData) => {
    if (!oldData) return oldData;
    const newData = {
      ...oldData,
      pages: [
        {
          data: [tweet, ...(oldData.pages[0]?.data || [])],
          pagination: oldData.pages[0]?.pagination,
        },
        ...oldData.pages.slice(1),
      ],
    };
    return newData;
  });
}

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

watch(
  () => tab.value,
  () => {
    // Invalidate and refetch tweets when tab changes
    queryClient.invalidateQueries({ queryKey: [tab.value] });
  },
);
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <TweetComposer class="mt-15 border-b-1" @posted="handlePost" />
    <ClientOnly>
      <div v-if="tweets" ref="parentRef">
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

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary mt-20 flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </ClientOnly>
    <div
      v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-20 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
