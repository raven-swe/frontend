import { useInfiniteQuery } from '@tanstack/vue-query';
import type { DmConversation, DmSseEventMap } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';
import { useDmHighlight } from './useDmHighlight';

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
      // staleTime: 0,
    });

  const { highlightedIds } = useDmHighlight();

  // Track conversations that have been moved to top
  const movedToTopIds = useState<Set<string>>('dm-moved-to-top-ids', () => new Set());

  const lastNewMessageinfo = inject<Ref<DmSseEventMap['dm.new_message'] | null>>(
    'lastNewMessageinfo',
    ref(null),
  );

  const lastProcessedMessageId = ref<string | null>(null);

  // Flatten all pages into a single array and merge with pending new conversations
  const allConversations = computed(() => {
    const fetched = data.value ? data.value.pages.flatMap((page) => page.data) : [];
    const fetchedIds = new Set(fetched.map((c) => c.id));

    // Filter out pending conversations that are already in fetched data
    const uniquePending = pendingNewConversations.value.filter((c) => !fetchedIds.has(c.id));

    // Pending conversations go first, then fetched ones
    return [...uniquePending, ...fetched];
  });

  watch(
    () => lastNewMessageinfo.value,
    (newMessage) => {
      if (!newMessage || !allConversations.value.length) return;

      if (newMessage.messageId === lastProcessedMessageId.value) return;
      lastProcessedMessageId.value = newMessage.messageId;

      const conversation = allConversations.value.find((c) => c.id === newMessage.conversationId);
      if (conversation) {
        conversation.lastMessage = {
          content: newMessage.bodySnippet,
          senderUsername: newMessage.sender.username,
          sentAt: newMessage.createdAt,
        };
      }
    },
    { immediate: false },
  );

  watch(
    highlightedIds,
    (newIds) => {
      newIds.forEach((id) => {
        movedToTopIds.value.add(id);
      });
    },
    { deep: true },
  );

  const sortedConversations = computed(() => {
    if (!allConversations.value.length) return [];

    const list = [...allConversations.value];

    list.sort((a, b) => {
      const aIsTop = movedToTopIds.value.has(a.id);
      const bIsTop = movedToTopIds.value.has(b.id);

      if (aIsTop && !bIsTop) return -1;
      if (!aIsTop && bIsTop) return 1;
      return 0;
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
