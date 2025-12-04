import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '@/api';

export function useStartConversation() {
  const queryClient = useQueryClient();

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
      // Add the new conversation to the cache immediately
      queryClient.setQueryData<DmConversation[]>(['dm-conversations'], (oldData) => {
        if (!oldData) return [newConversation];
        // Check if conversation already exists
        const exists = oldData.some((c) => c.id === newConversation.id);
        if (exists) return oldData;
        return [newConversation, ...oldData];
      });
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
