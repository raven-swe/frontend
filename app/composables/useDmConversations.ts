import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';

export function useDmConversations() {
  const { data, pending, error, refresh } = useAsyncData('dm-conversations', async () => {
    const resp = await $fetch<ApiSuccessResponse<DmConversation[]>>('/api/conversations', {
      method: 'GET',
    });
    return resp.data;
  });

  const conversations = computed(() => data.value || []);

  return { conversations, loading: pending, error, refresh };
}
