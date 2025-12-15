<script setup lang="ts">
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';
import { useProfileTweets } from '~/composables/tweet/useTweetLists';
import { getItemKey } from '~/constants/query-keys';

definePageMeta({
  layout: 'profile',
});

const user = inject<ComputedRef<User>>('user-data');
const isBlockedBy = computed(() => user?.value.relationship.blockedBy || false);

const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  suspense,
} = useProfileTweets(
  'tweets',
  computed(() => user?.value.username || ''),
);

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);

onServerPrefetch(async () => {
  await suspense();
});
</script>

<template>
  <div>
    <div v-if="isBlockedBy" class="border-b-1 p-8">
      <h1 class="text-2xl font-semibold">
        {{ $t('profile.messages.blocked-by.title', { username: user?.username || '' }) }}
      </h1>
      <p class="text-muted-foreground">
        {{ $t('profile.messages.blocked-by.description', { username: user?.username || '' }) }}
      </p>
    </div>

    <ClientOnly>
      <VirtualInfiniteScroller
        v-if="!isBlockedBy"
        :items="tweets"
        :has-next-page="hasNextPage"
        :is-fetching-next-page="isFetchingNextPage"
        :fetch-next-page="fetchNextPage"
        :get-key="getItemKey"
      >
        <template #item="{ item }">
          <TweetDefaultCard v-if="item" :tweet-id="item.id" :reposter-id="item.reposterId" />
        </template>
      </VirtualInfiniteScroller>

      <div
        v-if="(hasNextPage && isFetchingNextPage) || isLoading"
        class="text-primary flex shrink-0 items-center justify-center py-4"
      >
        <UiSpinner />
      </div>
    </ClientOnly>
    <div
      v-if="tweets.length === 0 && !isFetchingNextPage && !isLoading"
      data-testid="empty-state"
      class="text-muted-foreground mt-10 text-center"
    >
      <h1 class="text-xl font-semibold">{{ $t('testing.tweets.tweet-not-found') }}</h1>
    </div>
  </div>
</template>
