<script lang="ts" setup>
import DmMessagesList from './DmMessagesList.vue';
import { useRoute, useRouter } from 'vue-router';
import { useDmMessages } from '@/composables/useDmMessages';

import { showToaster } from '@/utils/showToaster';
import Spinner from '~/components/ui/Spinner.vue';
import type { DmMessage } from '~~/shared/types/dm';

const route = useRoute();
const router = useRouter();
const conversationId = computed(() => route.params.conversationId as string | null);

const userStore = useUserStore();
const currentUsername = computed(() => userStore.user.username);

const {
  conversations,
  loading: conversationsLoading,
  error: conversationsError,
} = useDmConversations();

const conversation = computed<DmConversation | null>(() => {
  if (!conversationId.value) return null;
  return conversations.value?.find((c) => c.id === conversationId.value) || null;
});

const {
  messages: initialMessages,
  loading: messagesLoading,
  error: messagesError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useDmMessages(() => conversationId.value);

const ws = useDmSocketIO();
provide('dmSocket', ws);
const liveMessages = ref<DmMessage[]>([]);

const lastSeenMessageId = ref<string | null>(null);

const messages = computed(() => {
  const initial = initialMessages.value || [];
  // Add live messages at the END (bottom) so they appear as newest
  const combined = [...initial, ...liveMessages.value];

  return combined;
});

watch(
  conversationId,
  (newId) => {
    if (newId) {
      // Connect socket if not already connected
      if (!ws.isConnected.value) {
        ws.connect();
      }

      // Reset live messages and seen state when switching conversations
      liveMessages.value = [];
      lastSeenMessageId.value = null;
    }
  },
  { immediate: true },
);

// Mark messages as seen when messages load and we're connected
// This needs to wait for messages to actually load
watch(
  [() => messages.value, () => ws.isConnected.value, conversationId],
  ([msgs, connected, convId]) => {
    if (connected && convId && msgs.length > 0) {
      const lastMessage = msgs[msgs.length - 1];
      if (lastMessage?.id && !lastMessage.isMine) {
        ws.markSeen(convId, lastMessage.id);
      }
    }
  },
  { immediate: true },
);

// Handle incoming Socket messages
onMounted(() => {
  ws.onMessage((message) => {
    if (conversationId.value && message) {
      // Push new messages to the end (bottom of chat)
      liveMessages.value.push(message);
    }
  });

  ws.onSeenUpdate((data) => {
    if (data.conversationId === conversationId.value && data.username === currentUsername.value) {
      lastSeenMessageId.value = data.lastSeenMessageId;
    }
  });

  ws.onError((error) => {
    showToaster('error', `Socket error: ${error}`);
  });
});

watch(messagesError, (val) => val && showToaster('error', 'Failed to load messages'));
watch(conversationsError, (val) => val && showToaster('error', 'Failed to load conversation'));
watch(
  [
    () => messagesLoading.value,
    () => conversationsLoading.value,
    () => initialMessages.value,
    () => conversation.value,
    conversationId,
  ],
  ([msgsLoading, convsLoading, msgs, conv, convId]) => {
    if (msgsLoading || convsLoading) return;
    if (convId && !conv && msgs && msgs.length === 0) {
      router.replace('/messages');
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <DmConversationHeader
      :username="conversation?.participant.username || conversationId"
      :avatar-url="conversation?.participant.avatarUrl || ''"
    />
    <div class="flex flex-1 flex-col overflow-hidden">
      <div
        v-if="conversationsLoading || messagesLoading"
        class="flex flex-1 items-center justify-center p-4"
      >
        <Spinner size="1.5rem" />
      </div>
      <DmMessagesList
        v-else
        class="flex-1 px-4 pb-4"
        :messages="messages || []"
        :has-next-page="hasNextPage || false"
        :is-fetching-next-page="isFetchingNextPage || false"
        :on-load-more="fetchNextPage"
        :last-seen-message-id="lastSeenMessageId"
        :conversation="conversation || null"
      />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
