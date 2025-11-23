<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { profileTabsService } from '~/services/profile/profileTabsService';

definePageMeta({
  layout: 'profile',
});

const user = inject<ComputedRef<User>>('user-data');

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  suspense,
} = useInfiniteQuery({
  queryKey: ['profile', user?.value.username, 'replies'],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await profileTabsService.getProfileRepliesPaginated(user?.value.username || '', pageParam),

  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

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
  <div>
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
            :key="String(virtualRow.key)"
            :ref="measureElement"
            :data-index="virtualRow.index"
          >
            <TweetDefaultCard v-if="tweets[virtualRow.index]" :tweet="tweets[virtualRow.index]!" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="hasNextPage && isFetchingNextPage"
      class="text-primary flex shrink-0 items-center justify-center py-4"
    >
      <UiSpinner />
    </div>
    <div v-else data-testid="empty-state" class="text-muted-foreground mt-10 text-center">
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
