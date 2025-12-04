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
import { searchService } from '~/services/search/searchService';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { useSearchQuery } from '~/composables/useSearchQuery';

definePageMeta({
  layout: 'search',
});

const { searchQuery, initializeFromRoute } = useSearchQuery();
const route = useRoute();

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
  queryKey: computed(() => ['search', 'users', searchQuery.value]),
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await searchService.getPeople({ limit: 20, cursor: pageParam }, searchQuery.value),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const users = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

//  Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

// Recalculate offset whenever content changes
watch(
  () => users.value.length,
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
    count: hasNextPage ? users.value.length + 1 : users.value.length,
    estimateSize: () => 70,
    overscan: 5,
    scrollMargin: parentOffsetRef.value,
    getItemKey: (index: number) => users.value[index]?.id || index,
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

  if (lastItem.index >= users.value.length - 3 && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage();
  }
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div class="border-border mx-auto mt-30 max-w-[700px]">
    <div v-if="users.length === 0 && !isLoading" class="p-20 break-words">
      <p class="text-foreground text-3xl font-bold">
        {{ $t('search.no-results', { query: searchQuery }) }}
      </p>
      <p class="text-md text-muted-foreground mt-5">
        {{ $t('search.try-searching') }}
      </p>
    </div>

    <!-- Users Section -->
    <div ref="parentRef" class="border-border mx-auto max-w-[700px]">
      <ClientOnly>
        <div v-if="users">
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
                :key="users[virtualRow.index]?.id || String(virtualRow.key)"
                :ref="measureElement"
                :data-index="virtualRow.index"
              >
                <NuxtLink
                  v-if="users[virtualRow.index]"
                  :to="`/profile/${users[virtualRow.index]!.username}`"
                  class="hover:bg-accent border-border flex items-center gap-3 border-b px-4 py-3 transition-colors"
                >
                  <img
                    :src="users[virtualRow.index]!.profileImage"
                    :alt="users[virtualRow.index]!.name"
                    class="h-12 w-12 rounded-full object-cover"
                  />
                  <div class="flex-1 overflow-hidden">
                    <div class="text-foreground truncate font-semibold">
                      {{ users[virtualRow.index]!.name }}
                    </div>
                    <div class="text-muted-foreground truncate text-sm">
                      {{ $t('@') }}{{ users[virtualRow.index]!.username }}
                    </div>
                  </div>
                </NuxtLink>
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
