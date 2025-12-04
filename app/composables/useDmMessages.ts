import { useQuery } from '@tanstack/vue-query';
import type { DmMessage, DmConversationMessagesResponse } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmMessages(conversationId: () => string | null) {
  const idRef = computed(() => conversationId());

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dm-messages', idRef],
    queryFn: async () => {
      const id = idRef.value;

      if (!id) return [] as DmMessage[];
      const resp = await apiFetch<ApiSuccessResponse<DmConversationMessagesResponse>>(
        `/api/conversations/${id}/messages`,
      );
      return resp.data.messages;
    },
    enabled: computed(() => !!idRef.value),
  });

  return { messages: data, loading: isPending, error, refresh: refetch };
}
