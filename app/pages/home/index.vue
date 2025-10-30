<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useInfiniteScroll, useVirtualList } from '@vueuse/core';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';
import { homeService, type Pagination } from '~/services/home/homeService';

definePageMeta({
  layout: 'home',
});

const tweets = ref<Tweet[]>([]);
const cursor = ref<string | null>(null);
const hasNextPage = ref(true);
const isLoading = ref(false);

async function loadTweets() {
  isLoading.value = true;

  try {
    const resp = await homeService.forYou({
      limit: 10,
      cursor: cursor.value ?? null,
    });

    // Canonical response shape: ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>
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

onMounted(async () => {
  await loadTweets();
});
</script>

<template>
  <div v-bind="containerProps" class="border-border mx-auto max-w-[700px] border-y">
    <div>
      <TweetDefaultCard
        v-for="tweet in list"
        :key="(tweet as Tweet)?.data?.id ?? (tweet as Tweet)?.id"
        :tweet="(tweet as Tweet)?.data ?? (tweet as Tweet)"
      />
    </div>

    <div v-if="isLoading" class="text-muted-foreground py-4 text-center">
      {{ $t('home.messages.loadingMore') }}
    </div>

    <div v-if="!hasNextPage && !isLoading" class="text-muted-foreground py-4 text-center">
      {{ $t('home.messages.noMoreTweets') }}
    </div>
  </div>
</template>
