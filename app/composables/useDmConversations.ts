import { useInfiniteQuery, type useQueryClient } from '@tanstack/vue-query';
import type { DmConversation } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

// Shared state for pending new conversations (not yet returned by backend)
const pendingNewConversations = ref<DmConversation[]>([]);

export function addPendingConversation(conversation: DmConversation) {
  // Add only if not already in the list
  if (!pendingNewConversations.value.some((c) => c.id === conversation.id)) {
    pendingNewConversations.value = [conversation, ...pendingNewConversations.value];
  }
}

export function removePendingConversation(conversationId: string) {
  pendingNewConversations.value = pendingNewConversations.value.filter(
    (c) => c.id !== conversationId,
  );
}

type ConversationsCache = {
  pages: ApiSuccessResponse<DmConversation[]>[];
  pageParams: (string | undefined)[];
};

// Helper to update a conversation in the cache
function updateConversationInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  updater: (conversation: DmConversation) => DmConversation,
) {
  queryClient.setQueryData<ConversationsCache>(['dm-conversations'], (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: page.data.map((conv) => (conv.id === conversationId ? updater(conv) : conv)),
      })),
    };
  });
}

// Update lastMessage when new SSE message arrives
export function updateConversationLastMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  lastMessage: {
    content: string;
    senderUsername: string;
    sentAt: string;
    seen: boolean;
  },
) {
  updateConversationInCache(queryClient, conversationId, (conv) => ({
    ...conv,
    lastMessage,
  }));
}

// Mark conversation as seen
export function markConversationSeenInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
) {
  updateConversationInCache(queryClient, conversationId, (conv) => ({
    ...conv,
    lastMessage: conv.lastMessage ? { ...conv.lastMessage, seen: true } : null,
  }));
}

export function useDmConversations() {
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['dm-conversations'],
      queryFn: async ({ pageParam }) => {
        const resp = await apiFetch<ApiSuccessResponse<DmConversation[]>>('/api/conversations', {
          method: 'GET',
          query: {
            cursor: pageParam,
            limit: 20,
          },
        });

        // Remove any pending conversations that are now in the backend response
        const fetchedIds = new Set(resp.data.map((c) => c.id));
        pendingNewConversations.value = pendingNewConversations.value.filter(
          (c) => !fetchedIds.has(c.id),
        );

        return resp;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination?.hasNextPage && lastPage.pagination?.nextCursor) {
          return lastPage.pagination.nextCursor;
        }
        return undefined;
      },
    });

  // Flatten all pages into a single array and merge with pending new conversations
  const allConversations = computed(() => {
    const fetched = data.value ? data.value.pages.flatMap((page) => page.data) : [];
    const fetchedIds = new Set(fetched.map((c) => c.id));

    // Filter out pending conversations that are already in fetched data
    const uniquePending = pendingNewConversations.value.filter((c) => !fetchedIds.has(c.id));

    // Pending conversations go first, then fetched ones
    return [...uniquePending, ...fetched];
  });

  // Sort conversations by most recent message
  const sortedConversations = computed(() => {
    if (!allConversations.value.length) return [];

    const list = [...allConversations.value];

    list.sort((a, b) => {
      const aTime = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0;
      const bTime = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  });

  return {
    conversations: sortedConversations,
    loading: isPending,
    error,
    refresh: refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
