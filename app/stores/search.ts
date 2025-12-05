import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchQuery: '',
    removeBlocked: false,
  }),

  actions: {
    setRemoveBlocked(value: boolean) {
      this.removeBlocked = value;
    },
    setSearchQuery(value: string) {
      this.searchQuery = value;
    },
  },
});
