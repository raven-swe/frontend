<script setup lang="ts">
import { useRoute } from 'vue-router';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import NewTweetsIndicator from '~/components/tweet/NewTweetsIndicator.vue';
import { useTimelineTweets } from '~/composables/tweet/useTweetLists';
import { getItemKey } from '~/constants/query-keys';

function isTab(value: unknown): value is HomeTab {
  return typeof value === 'string' && validHomeTabs.includes(value as HomeTab);
}

definePageMeta({
  layout: 'home',
  validate: (context) => isTab(context.params.tab),
});

const route = useRoute();
const tab = computed(() => route.params.tab as HomeTab);

// Inject timeline following avatars from SSE (array of avatar URL strings)
const timelineFollowingAvatars = inject<Ref<string[]>>('timelineFollowingAvatars', ref([]));
const clearTimelineFollowingAvatars = inject<() => void>('clearTimelineFollowingAvatars', () => {});

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useTimelineTweets(computed(() => tab.value));

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

const handleNewTweetsClick = () => {
  clearTimelineFollowingAvatars();
};

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <div v-if="tab === 'following'" class="sticky top-20 z-50">
      <NewTweetsIndicator :avatars="timelineFollowingAvatars" @click="handleNewTweetsClick" />
    </div>
    <ClientOnly fallback="span">
      <template #fallback>
        <div class="text-primary mt-20 flex shrink-0 items-center justify-center py-4">
          <UiSpinner />
        </div>
      </template>

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
