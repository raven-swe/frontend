<script setup lang="ts">
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { searchService } from '~/services/search/searchService';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';
import { getItemKey } from '~/constants/query-keys';
import { useTweetSearch } from '~/composables/tweet/useTweetLists';
import { useInfiniteQuery } from '@tanstack/vue-query';
import VirtualInfiniteScroller from '~/components/common/VirtualInfiniteScroller.vue';

definePageMeta({
  layout: 'search',
});

const { searchQuery, initializeFromRoute } = useSearchQuery();
const route = useRoute();
const searchStore = useSearchStore();

// Compute people filter from URL
const peopleFilter = computed(() =>
  route.query.pf === 'on' ? PeopleFilter.following : PeopleFilter.anyone,
);

// Initialize search query from URL
initializeFromRoute();

// Watch for route query changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  },
  { immediate: true },
);

const { data: usersResponse, isFetching: isUsersLoading } = useInfiniteQuery({
  initialPageParam: null as string | null,
  queryKey: computed(() => [
    'user-list',
    'search',
    'top',
    searchQuery.value,
    peopleFilter.value,
    searchStore.excludeMutedAndBlocked,
  ]),
  queryFn: async ({ signal }) =>
    await searchService.getPeople(
      {
        pagination: { limit: 3, cursor: null },
        query: searchQuery.value,
        peopleFilter: peopleFilter.value,
        excludeMutedAndBlocked: searchStore.excludeMutedAndBlocked,
      },
      signal,
    ),
  getNextPageParam: () => null,
  structuralSharing: false,
});

const users = computed(() => usersResponse.value?.pages.flatMap((page) => page.data) || []);
const {
  data: response,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching: isTweetsLoading,
} = useTweetSearch(
  'top',
  searchQuery,
  peopleFilter,
  computed(() => searchStore.excludeMutedAndBlocked),
);

const tweets = computed(() => response.value?.pages.flatMap((page) => page.data) || []);
const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
const { mutate: muteUser } = useMuteMutation();

// Combined loading state
const isLoading = computed(() => isTweetsLoading.value || isUsersLoading.value);
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <!-- Users Section -->
    <div v-if="users.length > 0" class="border-border border-b">
      <h2 class="px-4 py-4 text-xl font-bold">{{ $t('search.people.tab') }}</h2>
      <div v-for="user in users" :key="user.username">
        <UserRow
          :user="user"
          @follow="followUser({ username: user.username, action: 'follow' })"
          @unfollow="followUser({ username: user.username, action: 'unfollow' })"
          @block="blockUser({ username: user.username, action: 'block' })"
          @mute="muteUser({ username: user.username, action: 'mute' })"
          @unblock="blockUser({ username: user.username, action: 'unblock' })"
          @unmute="muteUser({ username: user.username, action: 'unmute' })"
        />
      </div>
      <UiButton
        variant="ghost-primary"
        @click="
          $router.push(
            `/search/people?q=${encodeURIComponent(searchQuery)}${route.query.pf ? '&pf=on' : ''}`,
          )
        "
      >
        {{ $t('search.top.view-all') }}
      </UiButton>
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
        :values-to-watch="[users.length]"
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
        v-if="tweets.length === 0 && users.length === 0 && !isFetchingNextPage && !isLoading"
        data-testid="empty-state"
        class="mx-auto my-10 max-w-90 px-8 text-start break-words"
      >
        <h2 class="text-[2rem] leading-tight font-black">
          {{ $t('search.no-results', { query: searchQuery }) }}
        </h2>
        <p class="text-muted-foreground leading-tight" data-test="empty-description">
          {{ $t('search.try-searching') }}
        </p>
      </div>
    </ClientOnly>
  </div>
</template>
