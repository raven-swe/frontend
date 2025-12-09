<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useSearchQuery } from '~/composables/useSearchQuery';
import { searchService } from '~/services/search/searchService';
import type { CompactUser } from '~~/shared/types/user';
import Hashtag from '~/components/search/Hashtag.vue';
import HistoryItem from '~/components/search/HistoryItem.vue';

interface Props {
  showBackOnFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBackOnFocus: false,
});

interface History {
  type: 'user' | 'hashtag' | 'text';
  content: string | CompactUser;
}

const route = useRoute();
const { searchQuery, initializeFromRoute, navigateToSearch } = useSearchQuery();
const isFocused = ref(false);
const isLoading = ref(false);
const searchResults = ref<{
  users: CompactUser[];
  hashtags: string[];
} | null>(null);
const localStorageKey = 'searchHistory';
const searchHistory = ref<History[]>([]);
const showClearHistoryDialog = ref(false);

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

// Watch for route changes to close the dropdown
watch(
  () => route.path,
  () => {
    isFocused.value = false;
  },
);

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    saveInHistory({ type: 'text', content: searchQuery.value.trim() });
    navigateToSearch(searchQuery.value);
    isFocused.value = false;
  }
};

const isValidUsername = (username: string) => {
  // Username regex: alphanumeric and underscores, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const getCleanUsername = () => {
  const query = searchQuery.value.trim();
  // Remove leading @ if present
  const cleanQuery = query.startsWith('@') ? query.slice(1) : query;
  return cleanQuery;
};

const saveInHistory = (item: History) => {
  // Avoid duplicates
  searchHistory.value = searchHistory.value.filter((historyItem) => {
    if (item.type === 'user' && historyItem.type === 'user') {
      return (
        (historyItem.content as CompactUser).username !== (item.content as CompactUser).username
      );
    }
    return historyItem.content !== item.content;
  });
  searchHistory.value.unshift(item);
  // Limit history to last 10 items
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop();
  }
  localStorage.setItem(localStorageKey, JSON.stringify(searchHistory.value));
};

const deleteFromHistory = (index: number) => {
  searchHistory.value.splice(index, 1);
  localStorage.setItem(localStorageKey, JSON.stringify(searchHistory.value));
};

const clearAllHistory = () => {
  showClearHistoryDialog.value = true;
};

const ConfirmClearAllHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem(localStorageKey);
  showClearHistoryDialog.value = false;
};

onMounted(() => {
  initializeFromRoute();
  searchHistory.value = localStorage.getItem(localStorageKey)
    ? JSON.parse(localStorage.getItem(localStorageKey) || '[]')
    : [];
});
</script>

<template>
  <div class="relative flex w-full items-center gap-2 px-2 pt-2">
    <UiButton
      v-if="props.showBackOnFocus && isFocused"
      variant="icon"
      size="icon"
      @click="isFocused = false"
    >
      <Icon class="mx-3" :name="$t('icons.back-button-icon')" size="1.3rem" />
    </UiButton>
    <div class="relative flex-1">
      <UiSearchBar
        v-model="searchQuery"
        v-model:is-focused="isFocused"
        @submit="handleSearchSubmit"
      />
      <div v-if="isFocused" class="absolute start-0 end-0 top-full z-50 mt-2">
        <UiSearchList>
          <div v-if="searchQuery.trim() == '' && !isLoading">
            <p
              v-if="searchHistory.length == 0"
              class="text-muted-foreground flex w-full items-center justify-center py-10 text-center break-words"
            >
              {{ $t('ui.search.search-list.placeholder') }}
            </p>
            <div v-else>
              <div class="border-border flex items-center justify-between border-b px-4 pt-2 pb-1">
                <p class="text-foreground p-2 text-xl font-bold">
                  {{ $t('ui.search.search-list.recent') }}
                </p>
                <UiButton
                  variant="ghost-default"
                  class="text-primary mb-2 px-4 text-sm"
                  @click="clearAllHistory"
                  >{{ $t('ui.search.search-list.clear-all') }}</UiButton
                >
              </div>
              <HistoryItem
                v-for="(item, index) in searchHistory"
                :key="index"
                :type="item.type"
                :content="item.content"
                @delete="deleteFromHistory(index)"
              />
            </div>
          </div>

          <div v-else-if="searchResults && !isLoading">
            <!-- Hashtags Section -->
            <div v-if="searchResults.hashtags.length > 0" class="border-border border-b">
              <Hashtag
                v-for="hashtag in searchResults.hashtags"
                :key="hashtag"
                :hashtag="hashtag"
                @click="saveInHistory({ type: 'hashtag', content: hashtag })"
              />
            </div>
            <div v-if="searchResults.hashtags.length === 0" class="border-border border-b">
              <NuxtLink
                :to="`/search/top?q=${encodeURIComponent(searchQuery)}`"
                class="hover:bg-accent flex items-center transition-colors"
                @click="saveInHistory({ type: 'hashtag', content: searchQuery })"
              >
                <p class="text-foreground w-full p-4 break-words">
                  {{ $t('ui.search.search-list.search-for', { query: searchQuery }) }}
                </p>
              </NuxtLink>
            </div>

            <!-- Users Section -->
            <div v-if="searchResults.users.length > 0">
              <NuxtLink
                v-for="user in searchResults.users"
                :key="user.username"
                :to="`/profile/${user.username}`"
                class="hover:bg-accent flex items-center gap-3 px-4 py-3 transition-colors"
                @click="saveInHistory({ type: 'user', content: user })"
              >
                <img
                  :src="user.avatarUrl"
                  :alt="user.displayName"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div class="flex-1 overflow-hidden">
                  <div class="text-foreground truncate font-semibold">{{ user.displayName }}</div>
                  <div class="text-muted-foreground truncate text-sm">
                    {{ $t('@') }}{{ user.username }}
                  </div>
                </div>
              </NuxtLink>
            </div>
            <NuxtLink
              v-if="isValidUsername(getCleanUsername())"
              :to="`/profile/${getCleanUsername()}`"
              class="hover:bg-accent flex items-center transition-colors"
            >
              <p class="text-foreground w-full p-4 break-words">
                {{ $t('ui.search.search-list.go-to', { query: getCleanUsername() }) }}
              </p>
            </NuxtLink>
          </div>
        </UiSearchList>
      </div>
    </div>
  </div>
  <UiAlertDialog :open="showClearHistoryDialog" @update:open="showClearHistoryDialog = $event">
    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>
          {{ $t('ui.search.clear-dialog.title') }}
        </UiAlertDialogTitle>
        <UiAlertDialogDescription>
          {{ $t('ui.search.clear-dialog.description') }}
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogAction
          class="bg-destructive text-background hover:bg-destructive/90 focus-visible:bg-destructive/90 focus-visible:ring-ring-destructive dark:text-foreground"
          @click="ConfirmClearAllHistory"
        >
          {{ $t('ui.clear') }}
        </UiAlertDialogAction>
        <UiAlertDialogCancel @click="showClearHistoryDialog = false">
          {{ $t('ui.cancel') }}
        </UiAlertDialogCancel>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
