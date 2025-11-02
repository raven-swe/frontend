<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useInfiniteScroll, useVirtualList } from '@vueuse/core';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { homeService } from '~/services/home/homeService';
import type { ApiSuccessResponse } from '~~/shared/types/apiResponses';

definePageMeta({
  layout: 'home',
});

const route = useRoute();

const tweets = ref<Tweet[]>([]);
const cursor = ref<string | null>(null);
const hasNextPage = ref(true);
const isLoading = ref(false);

async function loadTweets(reset = false) {
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
      tweets.value.push(...newTweets);
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
