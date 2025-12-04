import { useInfiniteQuery } from '@tanstack/vue-query';
import type { DmMessage, DmConversationMessagesResponse } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export function useDmMessages(conversationId: () => string | null) {
  const idRef = computed(() => conversationId());

  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['dm-messages', idRef],
      queryFn: async ({ pageParam }) => {
        const id = idRef.value;
        if (!id) return { messages: [] as DmMessage[], nextCursor: null };

        const resp = await apiFetch<ApiSuccessResponse<DmConversationMessagesResponse>>(
          `/api/conversations/${id}/messages`,
          {
            query: {
              cursor: pageParam,
              limit: 20,
            },
          },
        );
        return {
          messages: resp.data.messages,
          nextCursor: resp.pagination?.nextCursor ?? null,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
      enabled: computed(() => !!idRef.value),
    });

  const allMessages = computed(() => {
    if (!data.value) return [];
    // Flatten all pages and reverse to get chronological order (oldest first)
    const flatMessages = data.value.pages.flatMap((page) => page.messages);
    return flatMessages.reverse();
  });

  return {
    messages: allMessages,
    loading: isPending,
    error,
    refresh: refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
