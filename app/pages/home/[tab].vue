<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { homeService } from '~/services/home/homeService';
import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/vue-query';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';

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

onServerPrefetch(async () => {
  await suspense();
});

const queryClient = useQueryClient();

function handlePost(tweet: Tweet) {
  // Optimistically add the new tweet to the top of the list
  if (!tab.value) return;
  queryClient.setQueryData<InfiniteData<{ data: Tweet[]; pagination?: CursorPagination }>>(
    [tab.value],
    (oldData) => {
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
    },
  );
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
      <VirtualInfiniteScroller
        :items="tweets"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
        :get-key="(item, index, key) => `${item?.id}-${item?.repostedBy?.username}-${key}`"
      >
        <template #item="{ item }">
          <TweetDefaultCard v-if="item" :tweet="item" />
        </template>
      </VirtualInfiniteScroller>
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
      class="mx-auto my-10 max-w-90 px-8 text-start break-words"
    >
      <h2 class="text-[2rem] leading-tight font-black">
        {{ $t('home.messages.empty.title') }}
      </h2>
      <p class="text-muted-foreground mt-1 leading-tight">
        {{ $t('home.messages.empty.description') }}
      </p>
    </div>
  </div>
</template>
