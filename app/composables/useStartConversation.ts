import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query';
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
      queryClient.setQueryData<InfiniteData<ApiSuccessResponse<DmConversation[]>>>(
        ['dm-conversations'],
        (oldData) => {
          if (!oldData) return oldData;

          // Check if conversation already exists in any page
          const exists = oldData.pages.some((page) =>
            page.data.some((c) => c.id === newConversation.id),
          );
          if (exists) return oldData;

          // Add new conversation to the first page
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  data: [newConversation, ...page.data],
                };
              }
              return page;
            }),
          };
        },
      );
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
