import { useQuery } from '@tanstack/vue-query';
import type { DmConversation, DmSseEventMap } from '~~/shared/types/dm';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';
import { useDmHighlight } from './useDmHighlight';

export function useDmConversations() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dm-conversations'],
    queryFn: async () => {
      const resp = await apiFetch<ApiSuccessResponse<DmConversation[]>>('/api/conversations', {
        method: 'GET',
      });
      return resp.data;
    },
  });

  const { highlightedIds } = useDmHighlight();

  // Track conversations that have been moved to top
  const movedToTopIds = useState<Set<string>>('dm-moved-to-top-ids', () => new Set());

  const lastNewMessageinfo = inject<Ref<DmSseEventMap['dm.new_message'] | null>>(
    'lastNewMessageinfo',
    ref(null),
  );

  const lastProcessedMessageId = ref<string | null>(null);

  watch(
    () => lastNewMessageinfo.value,
    (newMessage) => {
      if (!newMessage || !data.value) return;

      if (newMessage.messageId === lastProcessedMessageId.value) return;
      lastProcessedMessageId.value = newMessage.messageId;

      const conversation = data.value.find((c) => c.id === newMessage.conversationId);
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
    if (!data.value) return [];

    const list = [...data.value];

    list.sort((a, b) => {
      const aIsTop = movedToTopIds.value.has(a.id);
      const bIsTop = movedToTopIds.value.has(b.id);

      if (aIsTop && !bIsTop) return -1;
      if (!aIsTop && bIsTop) return 1;
      return 0;
    });

    return list;
  });

  return { conversations: sortedConversations, loading: isPending, error, refresh: refetch };
}
