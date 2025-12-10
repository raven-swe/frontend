import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '@/api';

type ConversationsCache = {
  pages: ApiSuccessResponse<DmConversation[]>[];
  pageParams: (string | undefined)[];
};

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
      // Add directly to the conversations cache
      queryClient.setQueryData<ConversationsCache>(['dm-conversations'], (oldData) => {
        if (!oldData) {
          // If no cache exists, create initial structure
          return {
            pages: [{ success: true, data: [newConversation], pagination: { hasNextPage: false } }],
            pageParams: [undefined],
          } as ConversationsCache;
        }

        // Check if conversation already exists in cache
        const exists = oldData.pages.some((page) =>
          page.data.some((conv) => conv.id === newConversation.id),
        );

        if (exists) return oldData;

        // Add new conversation to the beginning of the first page
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) =>
            index === 0 ? { ...page, data: [newConversation, ...page.data] } : page,
          ),
        };
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
