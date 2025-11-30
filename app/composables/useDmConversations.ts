import { useQuery } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmConversations() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dm-conversations'],
    queryFn: async () => {
      const resp = await apiFetch<ApiSuccessResponse<DmConversation[]>>('/api/conversations', {
        method: 'GET',
      });
      return resp.data;
    },
  });

  return { conversations: data, loading: isPending, error, refresh: refetch };
}
