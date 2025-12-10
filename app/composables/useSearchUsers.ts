import { useQuery } from '@tanstack/vue-query';

import type { ApiSuccessResponse } from '~~/shared/types/api';
import type { MaybeRefOrGetter } from 'vue';
import { apiFetch } from '~/api';

export function useSearchUsers(searchQuery: MaybeRefOrGetter<string>) {
  const queryRef = computed(() => toValue(searchQuery));

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['search-users', queryRef],
    queryFn: async () => {
      const query = queryRef.value;
      if (!query.trim()) return [] as CompactUser[];

      try {
        const resp = await apiFetch<ApiSuccessResponse<CompactUser[]>>('/api/search/users', {
          method: 'GET',
          query: { query },
        });

        const users = resp?.data ?? [];
        return Array.isArray(users) ? users : [];
      } catch {
        return [] as CompactUser[];
      }
    },
    enabled: computed(() => queryRef.value.trim().length > 0),
    retry: 0,
    refetchOnWindowFocus: false,
  });

  return {
    users: data,
    loading: isPending,
    error,
    refresh: refetch,
  };
}
