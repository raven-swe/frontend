import { useQuery } from '@tanstack/vue-query';
import type { SearchedUser } from '~~/shared/types/user';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import type { MaybeRefOrGetter } from 'vue';
import { apiFetch } from '~/api';

export function useSearchUsers(searchQuery: MaybeRefOrGetter<string>) {
  const queryRef = computed(() => toValue(searchQuery));

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['search-users', queryRef],
    queryFn: async () => {
      const query = queryRef.value;
      if (!query.trim()) return [] as SearchedUser[];

      try {
        const resp = await apiFetch<ApiSuccessResponse<{ users: SearchedUser[] }>>(
          '/api/search/users',
          {
            method: 'GET',
            query: { query },
          },
        );

        const users = resp?.data?.users ?? [];
        return Array.isArray(users) ? users : [];
      } catch {
        return [] as SearchedUser[];
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
