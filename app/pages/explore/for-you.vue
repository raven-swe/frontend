<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import Hashtag from '~/components/explore/Hashtag.vue';
import { exploreService } from '~/services/explore/exploreService';
import { homeService } from '~/services/home/homeService';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

definePageMeta({
  layout: 'explore',
});

const trendingHashtags = ref<TrendingHashtag[]>([]);
const isHashtagsLoading = ref(false);

const loadHashtags = async () => {
  isHashtagsLoading.value = true;
  try {
    const response = await exploreService.getForYou();
    trendingHashtags.value = response.data.trendingHashtags;
  } catch (error) {
    console.error('Failed to load trending hashtags:', error);
  } finally {
    isLoading.value = false;
  }
};

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: ['explore', 'for-you'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await homeService.getHomeTab({ limit: 10, cursor: pageParam }, 'for-you'),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

onMounted(() => {
  loadHashtags();
});

// Recalculate offset whenever content changes
watch(
  [trendingHashtags, () => tweets.value.length],
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
</script>

<template>
  <div class="border-border mx-auto mt-30 max-w-[700px]">
    <!-- Hashtags Section -->
    <div v-if="trendingHashtags.length > 0" class="border-border border-b">
      <Hashtag v-for="hashtag in trendingHashtags" :key="hashtag.hashtag" :hashtag="hashtag" />
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

    <div
      v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-20 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('errors.TWEET_NOT_FOUND') }}</h1>
    </div>
  </div>
</template>
