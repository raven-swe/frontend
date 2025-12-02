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
import type { User } from '~~/shared/types/user';

definePageMeta({
  layout: 'search',
});

const { searchQuery, initializeFromRoute } = useSearchQuery();
const route = useRoute();

const users = ref<User[]>([]);
const isUsersLoading = ref(false);

// Initialize search query from URL
onMounted(() => {
  initializeFromRoute();
  loadUsers();
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

const loadUsers = async () => {
  isUsersLoading.value = true;
  try {
    const response = await searchService.getPeople({ cursor: null, limit: 3 }, searchQuery.value);
    users.value = response.data;
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    isUsersLoading.value = false;
  }
};

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching: isLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: ['explore', 'for-you', searchQuery.value],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await searchService.getTweets({ limit: 10, cursor: pageParam }, searchQuery.value, 'top'),
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
  [users, () => tweets.value.length],
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
    <!-- Users Section -->
    <div v-if="users.length > 0" class="border-border border-b">
      <h2 class="px-4 py-4 text-xl font-bold">{{ $t('search.people.tab') }}</h2>
      <!-- -------------- Have to put the user preview component ----------------------- -->
      <NuxtLink
        v-for="user in users"
        :key="user.id"
        :to="`/profile/${user.username}`"
        class="hover:bg-accent flex items-center gap-3 px-4 py-3 transition-colors"
      >
        <img
          :src="user.profileImage"
          :alt="user.name"
          class="h-10 w-10 rounded-full object-cover"
        />
        <div class="flex-1 overflow-hidden">
          <div class="text-foreground truncate font-semibold">{{ user.name }}</div>
          <div class="text-muted-foreground truncate text-sm">{{ $t('@') }}{{ user.username }}</div>
        </div>
      </NuxtLink>
      <UiButton variant="link" :to="`/search/people?q=${encodeURIComponent(searchQuery)}`">{{
        $t('search.top.view-all')
      }}</UiButton>
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
