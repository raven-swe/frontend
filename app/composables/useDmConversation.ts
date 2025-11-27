import { useQuery } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmConversation(conversationId: () => string | null) {
  const idRef = computed(() => conversationId());

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dm-conversation', idRef],
    queryFn: async () => {
      if (!idRef.value) return null as DmConversation | null;
      const resp = await apiFetch<ApiSuccessResponse<DmConversation>>(
        `/api/conversations/${idRef.value}`,
      );
      return resp.data;
    },
    enabled: computed(() => !!idRef.value),
  });

  return {
    conversation: data,
    loading: isPending,
    error,
    refresh: refetch,
  };
}
