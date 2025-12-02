<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { searchService } from '~/services/search/searchService';
import type { User } from '~~/shared/types/user';
import Hashtag from '~/components/search/Hashtag.vue';

const route = useRoute();
const { searchQuery, initializeFromRoute, navigateToSearch } = useSearchQuery();
const isFocused = ref(false);
const isLoading = ref(false);
const searchResults = ref<{
  users: User[];
  hashtags: string[];
} | null>(null);

const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = null;
    return;
  }

  isLoading.value = true;
  try {
    const results = await searchService.search(searchQuery.value);
    searchResults.value = results;
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = null;
  } finally {
    isLoading.value = false;
  }
}, 300);

watch(searchQuery, (newQuery) => {
  if (newQuery.trim() === '') {
    searchResults.value = null;
    return;
  }
  debouncedSearch();
});

// Watch for route query changes and update search field
watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  },
  { immediate: true },
);

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    navigateToSearch(searchQuery.value);
    isFocused.value = false;
  }
};

// Initialize search query from URL on mount
onMounted(() => {
  initializeFromRoute();
});
</script>

<template>
  <div class="relative w-full px-4 pt-2">
    <UiSearchBar
      v-model="searchQuery"
      v-model:is-focused="isFocused"
      @submit="handleSearchSubmit"
    />
    <div
      v-if="isFocused && (searchQuery.trim() || searchResults)"
      class="absolute start-4 end-4 top-full z-50 mt-2"
    >
      <UiSearchList>
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <UiSpinner />
        </div>
        <div v-else-if="searchResults">
          <!-- Hashtags Section -->
          <div v-if="searchResults.hashtags.length > 0" class="border-border border-b">
            <Hashtag v-for="hashtag in searchResults.hashtags" :key="hashtag" :hashtag="hashtag" />
          </div>

          <!-- Users Section -->
          <div v-if="searchResults.users.length > 0">
            <NuxtLink
              v-for="user in searchResults.users"
              :key="user.id"
              :to="`/profile/${user.username}`"
              class="hover:bg-accent flex items-center gap-3 px-4 py-3 transition-colors"
              @click="isFocused = false"
            >
              <img
                :src="user.profileImage"
                :alt="user.name"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div class="flex-1 overflow-hidden">
                <div class="text-foreground truncate font-semibold">{{ user.name }}</div>
                <div class="text-muted-foreground truncate text-sm">
                  {{ $t('@') }}{{ user.username }}
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- No Results -->
          <div
            v-if="searchResults.hashtags.length === 0 && searchResults.users.length === 0"
            class="text-muted-foreground px-4 py-8 text-center text-sm"
          >
            {{ $t('ui.search.no-results') }}
          </div>
        </div>
      </UiSearchList>
    </div>
  </div>
</template>
