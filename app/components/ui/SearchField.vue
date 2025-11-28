<script lang="ts" setup>
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { apiFetch } from '~/api';

const searchQuery = ref('');
const isFocused = ref(false);
const debouncedSearch = useDebounceFn(async () => {
  try {
    return await apiFetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery.value }),
    });
  } catch (error) {
    console.error('Search error:', error);
  }
}, 300);

watch(searchQuery, (newQuery) => {
  if (newQuery.trim() === '') {
    return;
  }
  debouncedSearch();
});
</script>

<template>
  <div class="relative w-full px-4 pt-2">
    <UiSearchBar v-model="searchQuery" v-model:is-focused="isFocused" />
    <div v-if="isFocused" class="absolute start-4 end-4 top-full z-50 mt-2">
      <UiSearchList />
    </div>
  </div>
</template>
