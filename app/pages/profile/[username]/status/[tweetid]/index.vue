<script setup lang="ts">
import TweetView from '~/components/tweet/TweetView.vue';
import { isApiError, isApiValidationError } from '~/utils/errorUtils';
import { isTweetDeleted } from '~/utils/tweetDeleted';
import DeletedTweetPlaceholder from '~/components/tweet/DeletedTweetPlaceholder.vue';
import { useTweetReplies } from '~/composables/tweet/useTweetLists';
import { useTweetWithParents } from '~/composables/tweet/useTweet';
import { useQueryClient } from '@tanstack/vue-query';
import { tweetKeys } from '~/constants/query-keys';
import { prependTweetToInfiniteLists } from '~/composables/tweet/updateTweetList';

const router = useRouter();
const queryClient = useQueryClient();
const username = computed(() => router.currentRoute.value.params.username as string);
const tweetid = computed(() => router.currentRoute.value.params.tweetid as string);

const { data: tweetData, suspense, isPending, error } = useTweetWithParents(tweetid);

const {
  data: repliesResponse,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending: isRepliesLoading,
} = useTweetReplies(
  tweetid,
  computed(() => !!tweetData.value),
);

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

const replies = computed(() => repliesResponse.value?.pages.flatMap((page) => page.data) || []);

onMounted(async () => {
  await nextTick(() => {
    scrollMainTweetIntoView();
  });
});

const handleNewReply = (newReply: Tweet) => {
  const queryKeys = [
    tweetKeys.profileTab(newReply.author.username, 'replies'),
    tweetKeys.replyList(tweetid.value),
  ];
  prependTweetToInfiniteLists(queryClient, queryKeys, newReply);
};

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
        :tweet-id="tweetData.rootTweet.id"
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
        <TweetDefaultCard v-if="!isTweetDeleted(tweet)" :tweet-id="tweet.id" is-parent />
        <div v-else class="px-4 py-2">
          <DeletedTweetPlaceholder>
            {{ $t('tweet.deleted-parent') }}
          </DeletedTweetPlaceholder>
        </div>
      </template>
    </ClientOnly>

    <div ref="main-tweet-cont" class="min-h-[calc(100vh_-_3.25rem)]">
      <TweetView :tweet="tweetData" :media="true" />

      <div class="border-b">
        <TweetComposer :reply-to-tweet-id="tweetid" type="reply" @posted="handleNewReply" />
      </div>

      <ClientOnly placeholder-tag="div">
        <CommonVirtualInfiniteScroller
          :items="replies"
          :estimate-size="200"
          :has-next-page="hasNextPage"
          :is-fetching-next-page="isFetchingNextPage"
          :fetch-next-page="fetchNextPage"
          :get-key="(tweet, idx, key) => tweet.id ?? key"
          data-cy="tweet-replies"
        >
          <template #item="{ item: tweet }">
            <TweetDefaultCard v-if="tweet" :tweet-id="tweet.id" />
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
