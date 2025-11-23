<script setup lang="ts">
import { ref, onMounted, watch, inject, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useInfiniteScroll, useVirtualList } from '@vueuse/core';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { homeService } from '~/services/home/homeService';
import { useUserStore } from '~/stores/user';

definePageMeta({
  layout: 'home',
});

const route = useRoute();
const userStore = useUserStore();

const tweets = ref<Tweet[]>([]);
const cursor = ref<string | null>(null);
const hasNextPage = ref(true);
const isLoading = ref(false);

async function loadTweets(reset = false) {
  if (isLoading.value || (!reset && !hasNextPage.value)) return;

  if (reset) {
    tweets.value = [];
    cursor.value = null;
    hasNextPage.value = true;
  }

  isLoading.value = true;

  try {
    const fetchTweets =
      route.params.tab === 'following' ? homeService.following : homeService.forYou;

    const resp = await fetchTweets({
      limit: 10,
      cursor: cursor.value ?? null,
    });

    const body = resp as ApiSuccessResponse<Tweet[]>;
    const newTweets = body.data ?? [];
    const pagination = body?.pagination;

    if (newTweets.length) {
      tweets.value = [...tweets.value, ...newTweets];
      cursor.value = pagination?.nextCursor ?? null;
      hasNextPage.value = pagination?.hasNextPage ?? false;
    } else {
      hasNextPage.value = false;
    }
  } catch (err) {
    console.error('Failed to load tweets', err);
  } finally {
    isLoading.value = false;
  }
}

const { list, containerProps } = useVirtualList(tweets, {
  itemHeight: 120,
});

useInfiniteScroll(
  window,
  async () => {
    await loadTweets();
  },
  {
    distance: 200,
    canLoadMore: () => hasNextPage.value && !isLoading.value,
  },
);

onMounted(loadTweets);

// Register handler to receive posted tweets
const registerNewTweetHandler = inject<((cb: (t: Tweet) => void) => () => void) | undefined>(
  'registerNewTweetHandler',
);

let unregister: (() => void) | undefined;

if (registerNewTweetHandler) {
  unregister = registerNewTweetHandler((tweet: Tweet) => {
    // Only handle if it's a top-level tweet (not a reply) and we're on for-you tab
    if (tweet.replyToTweetId) return;
    if (route.params.tab !== 'for-you') return;

    // Avoid duplicates
    if (tweets.value.find((t) => t.id === tweet.id)) return;

    // Convert media URLs to proper media objects
    const mediaObjects =
      Array.isArray(tweet.media) && tweet.media.length > 0
        ? (tweet.media as unknown as string[]).map((url) => ({
            id: '',
            type: 'IMAGE' as const,
            url,
            altText: '',
            width: 0,
            height: 0,
          }))
        : [];

    // Complete the tweet object with user info from store
    const completeTweet: Tweet = {
      ...tweet,
      media: mediaObjects,
      author: {
        username: userStore.user.username,
        displayName: userStore.user.displayName,
        avatarUrl: userStore.user.avatarUrl,
        isFollowing: false,
        isFollower: false,
      },
      replyCount: 0,
      retweetCount: 0,
      likeCount: 0,
      isLiked: false,
      isRetweeted: false,
    };

    tweets.value = [completeTweet, ...tweets.value];
  });
}

onBeforeUnmount(() => {
  if (unregister) unregister();
});

watch(
  () => route.params.tab,
  () => loadTweets(true),
);
</script>

<template>
  <div v-bind="containerProps" class="border-border mx-auto max-w-[700px] border-y">
    <div>
      <TweetDefaultCard v-for="{ data: tweet } in list" :key="tweet.id" :tweet="tweet" />
    </div>

    <div v-if="isLoading" class="text-muted-foreground py-4 text-center">
      {{ $t('home.messages.loadingMore') }}
    </div>

    <div v-if="!hasNextPage && !isLoading" class="text-muted-foreground py-4 text-center">
      {{ $t('home.messages.noMoreTweets') }}
    </div>
  </div>
</template>
