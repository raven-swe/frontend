<script setup lang="ts">
import {
  ref,
  onMounted,
  watch,
  computed,
  watchEffect,
  onServerPrefetch,
  nextTick,
  type ComponentPublicInstance,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TweetView from '~/components/tweet/TweetView.vue';
import type { Tweet } from '~~/shared/types/tweets';
import type { CursorPagination } from '~~/shared/types/api';
import { tweetsService } from '~/services/tweet/tweetsService';
import { isApiError, isApiValidationError } from '~/utils/errorUtils';
import { showToaster } from '~/utils/showToaster';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const isLoading = ref(false);
const tweetData = ref<Tweet | null>(null);
const isMainTweetFound = ref(true);

const username = computed(() => route.params.username as string);
const tweetid = computed(() => route.params.tweetid as string);

async function loadMainTweet() {
  isLoading.value = true;
  isMainTweetFound.value = true;
  try {
    const resp = await tweetsService.tweet(tweetid.value);
    tweetData.value = resp.data;
    if (tweetData.value && tweetData.value.author.username !== username.value) {
      router.replace(`/profile/${tweetData.value.author.username}/status/${tweetData.value.id}`);
    }
  } catch (error) {
    if ((isApiError(error) && error.data?.statusCode === 404) || isApiValidationError(error)) {
      isMainTweetFound.value = false;
    } else {
      showToaster('error', 'toaster.tweet-page.tweet-load-error', true);
    }
  } finally {
    isLoading.value = false;
  }
}

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isRepliesLoading,
  suspense,
} = useInfiniteQuery({
  queryKey: ['tweet-replies', tweetid],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await tweetsService.replies(tweetid.value, { limit: 10, cursor: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
});

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

// Virtualization setup
const parentRef = ref<HTMLElement | null>(null);
const parentOffsetRef = ref(0);

onMounted(() => {
  loadMainTweet();
});

// Recalculate offset whenever content changes
watch(
  [tweetData, () => tweets.value.length],
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

watch(
  () => [route.params.username, route.params.tweetid],
  ([newUsername, newTweetid], [oldUsername, oldTweetid]) => {
    if (newUsername !== oldUsername || newTweetid !== oldTweetid) {
      tweetData.value = null;
      loadMainTweet();
    }
  },
);

watch(tweetData, () => {
  if (parentRef.value) {
    setTimeout(() => {
      parentOffsetRef.value = parentRef.value.offsetTop;
    }, 100);
  }
});

onServerPrefetch(async () => {
  await suspense();
});

function goBackToHome() {
  router.back();
}

function handleReplied(tweet: Tweet) {
  // Check if the reply is for the current tweet
  if (tweet.replyToTweetId === tweetid.value) {
    // Optimistically add the new tweet to the top of the list
    queryClient.setQueryData<{
      pages: Array<{ data: Tweet[]; pagination?: CursorPagination }>;
      pageParams: Array<string | null>;
    }>(['tweet-replies', tweetid], (oldData) => {
      if (!oldData) return oldData;

      // Add the new tweet to the beginning of the first page
      return {
        ...oldData,
        pages: [
          {
            data: [tweet, ...(oldData.pages[0]?.data || [])],
            pagination: oldData.pages[0]?.pagination,
          },
          ...oldData.pages.slice(1),
        ],
      };
    });

    // Force virtualizer to recalculate after DOM updates
    nextTick(() => {
      // Reset the virtualizer range to force re-render
      const virtualizer = rowVirtualizer.value;
      virtualizer.scrollToIndex(0, { align: 'start' });

      setTimeout(() => {
        if (parentRef.value) {
          // Scroll to the top of the replies section
          const headerHeight = 48;
          const offset = parentRef.value.offsetTop - headerHeight;
          window.scrollTo({
            top: offset,
            behavior: 'smooth',
          });
        }
      }, 100);
    });
  }
}
</script>

<template>
  <div v-if="isLoading" class="mt-10">
    <UiSpinner class="text-primary mx-auto my-auto"></UiSpinner>
  </div>
  <div v-else>
    <div
      v-if="!isMainTweetFound"
      class="mt-20 flex flex-col items-center justify-center p-8 text-center"
    >
      <h1 class="mb-5 text-3xl font-bold">{{ $t('errors.TWEET_NOT_FOUND') }}</h1>
      <UiButton
        variant="link"
        size="link"
        class="text-gray-600 dark:text-gray-400"
        @click="goBackToHome"
        >{{ $t('errors.GO_BACK_HOME') }}</UiButton
      >
    </div>
    <div v-else>
      <button
        class="hover:bg-muted bg-background/60 fixed top-0 z-50 inline-flex h-12 w-full max-w-[598px] cursor-pointer items-center gap-2 rounded-b-md px-3 py-1 text-sm font-medium backdrop-blur-sm"
        @click="goBackToHome"
      >
        <Icon :name="$t('icons.back-button-icon')" size="1.3rem" />
        <span class="ps-8 text-xl font-bold">{{ $t('ui.post') }}</span>
      </button>

      <div v-if="tweetData" class="mt-10">
        <TweetView :tweet="tweetData" />
      </div>

      <TweetComposer
        :reply-to-tweet-id="tweetData?.id"
        placeholder="reply"
        @posted="handleReplied"
      />

      <div ref="parentRef" class="border-border mx-auto max-w-[700px] border-y">
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
          v-if="(hasNextPage && isFetchingNextPage) || isRepliesLoading"
          class="text-primary flex shrink-0 items-center justify-center py-4"
        >
          <UiSpinner />
        </div>
        <div
          v-if="tweets.length === 0 && !isFetchingNextPage && !isRepliesLoading"
          class="text-muted-foreground mt-8 h-12 text-center"
        >
          {{ $t('tweet.no-replies') }}
        </div>
      </div>
    </div>
  </div>
</template>
