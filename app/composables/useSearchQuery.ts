import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export const useSearchQuery = () => {
  const route = useRoute();
  const router = useRouter();
  const searchQuery = ref<string>('');

  const initializeFromRoute = () => {
    const queryParam = route.query.q;
    if (typeof queryParam === 'string') {
      searchQuery.value = queryParam;
    }
  };

  const navigateToSearch = (query: string, tab: string = 'top') => {
    if (!query.trim()) return;

    router.push({
      path: `/search/${tab}`,
      query: { q: query.trim() },
    });
  };

  return {
    searchQuery,
    initializeFromRoute,
    navigateToSearch,
  };
};
