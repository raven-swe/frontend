import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchQuery: '',
    excludeMutedAndBlocked: true,
  }),

  actions: {
    setexcludeMutedAndBlocked(value: boolean) {
      this.excludeMutedAndBlocked = value;
    },
    setSearchQuery(value: string) {
      this.searchQuery = value;
    },
  },
});
