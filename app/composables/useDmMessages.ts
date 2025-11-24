import type { DmMessage } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmMessages(conversationId: () => string | null) {
  const idRef = computed(() => conversationId());

  const { data, pending, error, refresh } = useAsyncData(
    () => `dm-messages-${idRef.value}`,
    async () => {
      const id = idRef.value;

      if (!id) return [] as DmMessage[];
      const resp = await apiFetch<ApiSuccessResponse<DmMessage[]>>(
        `/api/conversations/${id}/messages`,
      );
      return resp.data;
    },
    { watch: [idRef] },
  );

  const messages = computed(() => data.value || []);

  return { messages, loading: pending, error, refresh };
}
