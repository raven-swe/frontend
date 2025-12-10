<script setup lang="ts">
import TweetView from '~/components/tweet/TweetView.vue';
import type { Tweet, TweetWithParents } from '~~/shared/types/tweets';
import type { ApiErrorResponse, ApiSuccessResponse } from '~~/shared/types/api';
import { tweetsService } from '~/services/tweet/tweetsService';
import { isApiError, isApiValidationError } from '~/utils/errorUtils';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/vue-query';
import { isTweetDeleted } from '~/utils/tweetDeleted';
import DeletedTweetPlaceholder from '~/components/tweet/DeletedTweetPlaceholder.vue';

const router = useRouter();
const queryClient = useQueryClient();
const username = computed(() => router.currentRoute.value.params.username as string);
const tweetid = computed(() => router.currentRoute.value.params.tweetid as string);

const {
  data: tweetData,
  suspense,
  isPending,
  error,
} = useQuery<TweetWithParents, ApiErrorResponse>({
  queryKey: ['tweet', tweetid],
  queryFn: async () => (await tweetsService.tweet(tweetid.value)).data,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: false,
  structuralSharing: false,
});

const oldestParent = computed(() => tweetData.value?.parentTweets?.at(0) || null);

const mainTweetContRef = useTemplateRef<HTMLElement>('main-tweet-cont');
const headerRef = useTemplateRef<HTMLElement>('header-ref');

function scrollMainTweetIntoView() {
  const el = mainTweetContRef.value;
  const header = headerRef.value;
  if (!el || !header) return;
  const headerHeight = header.offsetHeight;
  const topOfElement = window.pageYOffset + el.getBoundingClientRect().top - headerHeight;
  window.scrollTo({
    top: topOfElement,
    behavior: 'instant',
  });
}

watch(
  () => tweetData.value,
  async (newTweet) => {
    if (newTweet) {
      if (newTweet.author.username !== username.value) {
        await router.replace(`/profile/${newTweet.author.username}/status/${newTweet.id}`);
      }
      await nextTick(() => {
        scrollMainTweetIntoView();
      });
    }
  },
  { immediate: true },
);

const {
  data: repliesResponse,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending: isRepliesLoading,
} = useInfiniteQuery({
  queryKey: ['tweet-replies', tweetid],
  initialPageParam: null as string | null,
  queryFn: async ({ pageParam = null }) =>
    await tweetsService.replies(tweetid.value, { limit: 10, cursor: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  enabled: computed(() => !!tweetData.value),
});

const replies = computed(() => repliesResponse.value?.pages.flatMap((page) => page.data) || []);

function handleReplied(tweet: Tweet) {
  if (tweet.replyToTweetId !== tweetid.value) return;

  queryClient.setQueryData<{
    pages: Array<ApiSuccessResponse<Tweet[]>>;
    pageParams: Array<string | null>;
  }>(['tweet-replies', tweetid], (old) => {
    if (!old) return old;

    const first = old.pages[0];
    if (!first) return old;

    return {
      ...old,
      pages: [
        {
          ...first,
          data: [tweet, ...first.data],
        },
        ...old.pages.slice(1),
      ],
    };
  });
}
onMounted(async () => {
  await nextTick(() => {
    scrollMainTweetIntoView();
  });
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div v-if="isPending" class="flex h-full w-full items-center justify-center">
    <UiSpinner class="text-primary" />
  </div>
  <div
    v-else-if="
      error && (isApiValidationError(error) || (isApiError(error) && error.status === 404))
    "
    class="flexflex-col mt-20 items-center justify-center p-8 text-center"
  >
    <h1 class="mb-5 text-3xl font-bold">{{ $t('errors.TWEET_NOT_FOUND') }}</h1>
    <UiButton variant="link" size="link" class="text-primary underline" @click="$router.back()">{{
      $t('errors.GO_BACK_HOME')
    }}</UiButton>
  </div>
  <div v-else-if="tweetData" :key="tweetData.id" class="min-h-screen w-full">
    <header
      ref="header-ref"
      class="bg-background/65 sticky top-0 z-10 flex h-13 items-center gap-6 px-2 backdrop-blur-md"
    >
      <UiButton
        variant="ghost-default"
        size="icon-sm"
        class="bg-transparent"
        data-test="back-button"
        @click="$router.back()"
      >
        <Icon name="lucide:arrow-left" size="1.2rem" />
      </UiButton>
      <h1 class="text-foreground text-center text-xl font-semibold">
        {{ $t('ui.post') }}
      </h1>
    </header>

    <ClientOnly>
      <TweetDefaultCard
        v-if="tweetData.rootTweet && !isTweetDeleted(tweetData.rootTweet)"
        is-root
        :tweet="tweetData.rootTweet"
      />
      <div v-else-if="tweetData.rootTweet" class="bg-background relative h-14">
        <div class="px-4 pb-2">
          <DeletedTweetPlaceholder>
            {{ $t('tweet.deleted-parent') }}
          </DeletedTweetPlaceholder>
        </div>
      </div>
      <NuxtLink
        v-if="tweetData.hasMoreParents && oldestParent && !isTweetDeleted(oldestParent)"
        class="bg-background hover:bg-foreground/5 z-20 flex cursor-pointer flex-row items-center gap-2 px-4"
        :to="`/profile/${oldestParent.author.username}/status/${oldestParent.id}`"
      >
        <div class="flex h-8 w-10 flex-col items-center justify-center gap-1">
          <div class="bg-thread-foreground size-0.5"></div>
          <div class="bg-thread-foreground size-0.5"></div>
          <div class="bg-thread-foreground size-0.5"></div>
        </div>
        <p class="text-primary leading-tight select-none hover:underline">
          {{ $t('tweet.show-more-parents') }}
        </p>
      </NuxtLink>
      <template v-for="(tweet, i) in tweetData.parentTweets ?? []" :key="i">
        <TweetDefaultCard v-if="!isTweetDeleted(tweet)" :tweet="tweet" is-parent />
        <div v-else class="px-4 py-2">
          <DeletedTweetPlaceholder>
            {{ $t('tweet.deleted-parent') }}
          </DeletedTweetPlaceholder>
        </div>
      </template>
    </ClientOnly>

    <div ref="main-tweet-cont" class="min-h-[calc(100vh_-_3.25rem)]">
      <TweetView :tweet="tweetData" />

      <div class="border-b">
        <TweetComposer :reply-to-tweet-id="tweetData?.id" type="reply" @posted="handleReplied" />
      </div>

      <ClientOnly placeholder-tag="div">
        <CommonVirtualInfiniteScroller
          :items="replies"
          :estimate-size="200"
          :has-next-page="hasNextPage"
          :is-fetching-next-page="isFetchingNextPage"
          :fetch-next-page="fetchNextPage"
          :get-key="(tweet, idx, key) => tweet.id ?? key"
        >
          <template #item="{ item: tweet }">
            <TweetDefaultCard v-if="tweet" :tweet="tweet" />
          </template>
        </CommonVirtualInfiniteScroller>
        <div
          v-if="(hasNextPage && isFetchingNextPage) || isRepliesLoading"
          class="text-primary flex shrink-0 items-center justify-center py-4"
        >
          <UiSpinner />
        </div>
        <template #fallback>
          <div class="text-primary flex shrink-0 items-center justify-center py-4">
            <UiSpinner />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
