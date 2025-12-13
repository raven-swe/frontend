<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import Hashtag from '~/components/explore/Hashtag.vue';
import { exploreService } from '~/services/explore/exploreService';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import { useCategorizedTweet, useTimelineTweets } from '~/composables/tweet/useTweetLists';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import { getItemKey } from '~/constants/query-keys';

definePageMeta({
  layout: 'explore',
});

const trendingHashtags = ref<TrendingHashtag[]>([]);
const isHashtagsLoading = ref(false);

const loadHashtags = async () => {
  isHashtagsLoading.value = true;
  try {
    const response = await exploreService.getExploreTab('trending');
    trendingHashtags.value = response.data.slice(0, 5);
  } catch (error) {
    console.error('Failed to load trending hashtags:', error);
  } finally {
    isHashtagsLoading.value = false;
  }
};

const { data: categorizedResponse } = useCategorizedTweet();

const categorizedTweets = computed(() => {
  return categorizedResponse.value?.data.categories || [];
});

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useTimelineTweets('for-you');

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

onMounted(() => {
  loadHashtags();
});

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <!-- Hashtags Section -->
    <div v-if="trendingHashtags.length > 0" class="border-border border-b py-2">
      <Hashtag
        v-for="(hashtag, index) in trendingHashtags"
        :key="hashtag.hashtag"
        :hashtag="hashtag"
        :rank="index"
      />
    </div>

    <div v-for="categoryData in categorizedTweets" :key="categoryData.category">
      <h1 class="ps-4 pt-2 pb-3 text-2xl font-extrabold">{{ categoryData.category }}</h1>
      <TweetDefaultCard v-for="tweet in categoryData.tweets" :key="tweet.id" :tweet-id="tweet.id" />
    </div>

    <ClientOnly fallback="span">
      <template #fallback>
        <div class="text-primary mt-20 flex shrink-0 items-center justify-center py-4">
          <UiSpinner />
        </div>
      </template>
      <!-- Tweets Section -->
      <VirtualInfiniteScroller
        :items="tweets"
        :get-key="getItemKey"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
      >
        <template #item="{ item }">
          <TweetDefaultCard v-if="item" :tweet-id="item.id" :reposter-id="item.reposterId" />
        </template>
      </VirtualInfiniteScroller>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary mt-20 flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>

      <div
        v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
        data-testid="empty-state"
        class="mx-auto my-10 max-w-90 px-8 text-start break-words"
      >
        <p class="text-[2rem] leading-tight font-black">{{ $t('errors.TWEET_NOT_FOUND') }}</p>
      </div>
    </ClientOnly>
  </div>
</template>
