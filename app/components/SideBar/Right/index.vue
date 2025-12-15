<script lang="ts" setup>
import { exploreService } from '~/services/explore/exploreService';
import Hashtag from '~/components/explore/Hashtag.vue';
import { Label } from 'reka-ui';
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { settingsService } from '~/services/settingsService';
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';

const router = useRouter();
const route = useRoute();
const showWhatIsHappening = ref(true);
const showSearchField = ref(true);
const showFilters = ref(false);

// Compute the people filter value from URL
const peopleFilter = computed(() => {
  return route.query.pf === 'on' ? 'you-follow' : 'anyone';
});

const { data: trendingHashtagsData, isLoading: trendingIsLoading } = useQuery({
  queryKey: ['trending-hashtags', 'sidebar'],
  queryFn: async () => (await exploreService.getExploreTab('trending')).data.slice(0, 4) ?? [],
});

const goToExplore = () => {
  router.push({ name: 'explore', params: { tab: 'for-you' } });
};

const handlePeopleFilterChange = (value: string) => {
  const currentQuery = { ...route.query };

  if (value === 'you-follow') {
    currentQuery.pf = 'on';
  } else {
    delete currentQuery.pf;
  }

  router.push({
    path: route.path,
    query: currentQuery,
  });
};

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    showWhatIsHappening.value = !newPath.includes('explore');
    showSearchField.value = !newPath.includes('explore') && !newPath.includes('search');
    showFilters.value = newPath.includes('search');
  },
  { immediate: true },
);

const { data: whoToFollowItems } = useInfiniteQuery({
  queryKey: ['user-list', 'follow-suggestions', 'sidebar'],
  initialPageParam: null as string | null,
  queryFn: async ({ signal, pageParam }) =>
    await settingsService.getFollowSuggestions({
      cursor: pageParam,
      limit: 5,
      signal,
    }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const { mutate: followUser } = useFollowMutation();
</script>

<template>
  <div class="sticky top-0 z-50 ms-4">
    <div v-if="showSearchField" class="bg-background/60 backdrop-blur-sm">
      <UiSearchField />
    </div>
    <!-- Search Filters -->
    <div v-if="showFilters">
      <SideBarRightPreviewCard :title="$t('rightsidebar.search-filters.title')">
      </SideBarRightPreviewCard>
      <SideBarRightPreviewCard class="px-4 py-2">
        <p class="mb-3 text-lg font-bold">{{ $t('rightsidebar.search-filters.people.title') }}</p>

        <div>
          <UiRadioGroup :model-value="peopleFilter" @update:model-value="handlePeopleFilterChange">
            <div class="flex items-center justify-between">
              <Label class="text-md" for="r1">{{
                $t('rightsidebar.search-filters.people.any-one')
              }}</Label>
              <UiRadioGroupItem id="r1" value="anyone" data-cy="search-filter-people-anyone" />
            </div>
            <div class="flex items-center justify-between">
              <Label class="text-md" for="r2">{{
                $t('rightsidebar.search-filters.people.you-follow')
              }}</Label>
              <UiRadioGroupItem
                id="r2"
                value="you-follow"
                data-cy="search-filter-people-you-follow"
              />
            </div>
          </UiRadioGroup>
        </div>
      </SideBarRightPreviewCard>
    </div>
    <!-- What is happening -->
    <SideBarRightPreviewCard
      v-if="showWhatIsHappening"
      :title="$t('rightsidebar.whats-happening.title')"
      data-test="whats-happening-card"
      data-cy="whats-happening-card"
    >
      <ClientOnly>
        <div
          v-if="trendingIsLoading"
          class="text-primary flex shrink-0 items-center justify-center py-2"
        >
          <UiSpinner />
        </div>

        <Hashtag
          v-for="(hashtag, index) in trendingHashtagsData"
          v-else
          :key="hashtag.hashtag"
          :hashtag="hashtag"
          :rank="index"
        />
      </ClientOnly>
      <UiButton
        variant="ghost-primary"
        size="sm"
        data-cy="show-more-hashtags-button"
        @click="goToExplore"
      >
        {{ $t('rightsidebar.show-more') }}
      </UiButton>
    </SideBarRightPreviewCard>
    <!-- Who to follow -->
    <ClientOnly>
      <SideBarRightPreviewCard
        :title="$t('rightsidebar.who-to-follow.title')"
        data-cy="who-to-follow-card"
      >
        <UserRow
          v-for="item in whoToFollowItems?.pages.flatMap((page) => page.data) || []"
          :key="item.username"
          :user="item"
          :show-dropdown="false"
          :compact="true"
          @follow="followUser({ username: item.username, action: 'follow' })"
          @unfollow="followUser({ username: item.username, action: 'unfollow' })"
        />
      </SideBarRightPreviewCard>
    </ClientOnly>
  </div>
</template>
