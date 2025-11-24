import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmConversation(conversationId: () => string | null) {
  const idRef = computed(() => conversationId());

  const { data, pending, error, refresh } = useAsyncData(
    () => `dm-conversation-${idRef.value || 'none'}`,
    async () => {
      if (!idRef.value) return null as DmConversation | null;
      const resp = await apiFetch<ApiSuccessResponse<DmConversation>>(
        `/api/conversations/${idRef.value}`,
      );
      return resp.data;
    },
    { watch: [idRef] },
  );

  return {
    conversation: computed(() => data.value),
    loading: pending,
    error,
    refresh,
  };
}
