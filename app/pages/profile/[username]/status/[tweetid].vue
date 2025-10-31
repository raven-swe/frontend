<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { Pagination } from '~~/app/services/home/homeService';
import { useInfiniteScroll, useVirtualList } from '@vueuse/core';
import TweetView from '~/components/tweet/TweetView.vue';
import type { Tweet } from '~~/shared/types/tweets';

const route = useRoute();
const router = useRouter();
const tweets = ref<Tweet[]>([]);
const cursor = ref<string | null>(null);
const hasNextPage = ref(true);
const isLoading = ref(false);

const tweetid = route.params.tweetid as string;
const { data: tweetData } = await $fetch<{ data: Tweet }>(`/api/tweets/${tweetid}`);

async function loadTweets() {
  isLoading.value = true;

  try {
    const resp = await $fetch<{ data: Tweet[]; pagination: Pagination }>(
      `/api/tweets/${tweetid}/replies`,
      {
        query: {
          limit: 10,
          cursor: cursor.value ?? null,
        },
      },
    );

    const body = resp as { data?: { data?: Tweet[]; pagination?: Pagination } } | undefined;
    const data = body?.data;
    const newTweets = data?.data ?? [];
    const pagination = data?.pagination;

    if (newTweets.length) {
      tweets.value.push(...newTweets);
      cursor.value = pagination?.nextCursor ?? null;
      hasNextPage.value = pagination?.hasNextPage ?? false;
    }
  } catch (err) {
    console.error('Failed to load tweets', err);
  } finally {
    isLoading.value = false;
  }
}

const { list, containerProps } = useVirtualList(tweets.value, {
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
  loadTweets();
});

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

    <div v-bind="containerProps">
      <TweetDefaultCard
        v-for="tweet in list"
        :key="(tweet as Tweet)?.data?.id ?? (tweet as Tweet)?.id"
        :tweet="(tweet as Tweet)?.data ?? (tweet as Tweet)"
      />
      <div v-if="tweets.length === 0">{{ $t('tweets.no-replies') }}</div>
    </div>
  </div>
</template>
