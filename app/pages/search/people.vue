<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { searchService } from '~/services/search/searchService';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { useSearchStore } from '~/stores/search';
import { PeopleFilter } from '~~/shared/types/search';
import UserList from '~/components/user/UserList.vue';

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

// Initialize search query from URL - must happen before defining fetcherFn
onMounted(() => {
  initializeFromRoute();
});

// Watch for route query changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  },
  { immediate: true }, // Run immediately to catch initial route value
);

// Fetch function for user search - returns current searchQuery value
const fetcherFn = (cursor: string | null, signal: AbortSignal) => {
  return searchService.getPeople(
    {
      pagination: { limit: 20, cursor },
      query: searchQuery.value,
      peopleFilter: peopleFilter.value,
      excludeMutedAndBlocked: searchStore.excludeMutedAndBlocked,
    },
    signal,
  );
};
</script>

<template>
  <div class="border-border mx-auto max-w-[700px]">
    <UserList
      :fetcher-fn="fetcherFn"
      :current-username="'search'"
      :query-key-suffix="`search-people-${searchQuery}-${peopleFilter}-${searchStore.excludeMutedAndBlocked}`"
      :empty-title="$t('search.no-results', { query: searchQuery })"
      :empty-description="$t('search.try-searching')"
      :show-dropdown="false"
    />
  </div>
</template>
