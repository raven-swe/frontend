<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useInfiniteScroll, useVirtualList } from '@vueuse/core';
import TweetView from '~/components/tweet/TweetView.vue';
import type { Tweet } from '~~/shared/types/tweets';
import type { ApiSuccessResponse } from '~~/shared/types/apiResponses';
import { tweetsService } from '~/services/tweet/tweetsService';

const route = useRoute();
const router = useRouter();

const tweets = ref<Tweet[]>([]);
const cursor = ref<string | null>(null);
const hasNextPage = ref(true);
const repliesIsLoading = ref(false);
const isLoading = ref(false);
const tweetData = ref<Tweet | null>(null);

const tweetid = route.params.tweetid as string;

async function loadMainTweet() {
  isLoading.value = true;
  try {
    const resp = await tweetsService.tweet(tweetid);
    tweetData.value = resp.data;
  } catch (err) {
    console.error('Failed to load main tweet', err);
  } finally {
    isLoading.value = false;
  }
}

async function loadTweets(reset = false) {
  if (repliesIsLoading.value || (!reset && !hasNextPage.value)) return;

  if (reset) {
    tweets.value = [];
    cursor.value = null;
    hasNextPage.value = true;
  }

  repliesIsLoading.value = true;

  try {
    const resp = await tweetsService.replies(tweetid, { limit: 10, cursor: cursor.value });

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
    repliesIsLoading.value = false;
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

onMounted(() => {
  loadMainTweet();
  loadTweets();
});

watch(
  () => route.params.tab,
  () => loadTweets(true),
);

function goBackToHome() {
  router.back();
}
</script>

<template>
  <div>
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

    <TweetComposer placeholder="reply" />

    <div v-bind="containerProps" class="border-border mx-auto max-w-[700px] border-y">
      <div>
        <TweetDefaultCard v-for="{ data: tweet } in list" :key="tweet.id" :tweet="tweet" />
        <div
          v-if="tweets.length === 0"
          class="text-muted-foreground border-b-border mt-8 h-12 border-b-1 text-center"
        >
          {{ $t('tweet.no-replies') }}
        </div>
      </div>

      <UiSpinner v-if="repliesIsLoading && tweets.length > 0" class="text-primary mx-auto my-15">
      </UiSpinner>

      <div
        v-if="!hasNextPage && !repliesIsLoading && tweets.length > 0"
        class="text-muted-foreground py-4 text-center"
      >
        {{ $t('home.messages.noMoreTweets') }}
      </div>
    </div>
  </div>
</template>
