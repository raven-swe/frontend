import { useMutation } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '@/api';
import { addPendingConversation } from './useDmConversations';

export function useStartConversation() {
  const mutation = useMutation({
    mutationKey: ['start-conversation'],
    mutationFn: async (username: string) => {
      if (!username?.trim()) throw new Error('USERNAME_REQUIRED');
      const resp = await apiFetch<ApiSuccessResponse<DmConversation>>(
        `/api/conversations/with/${username}`,
        {
          method: 'POST',
        },
      );
      return resp.data;
    },
    onSuccess: (newConversation) => {
      // Add to pending conversations - will show immediately in the list
      addPendingConversation(newConversation);
    },
  });

  return {
    startConversation: mutation.mutateAsync,
    isStarting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
