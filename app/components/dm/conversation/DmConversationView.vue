<script lang="ts" setup>
import DmMessagesList from './DmMessagesList.vue';
import { useRoute } from 'vue-router';
import { useDmMessages } from '@/composables/useDmMessages';

import { showToaster } from '@/utils/showToaster';
import Spinner from '~/components/ui/Spinner.vue';
import type { DmMessage } from '~~/shared/types/dm';

const route = useRoute();
const conversationId = computed(() => route.params.conversationId as string | null);

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

const messages = computed(() => {
  const initial = initialMessages.value || [];
  // Add live messages at the END (bottom) so they appear as newest
  return [...initial, ...liveMessages.value];
});

watch(
  conversationId,
  (newId) => {
    if (newId) {
      // Connect socket if not already connected
      if (!ws.isConnected.value) {
        ws.connect();
      }

      // Reset live messages when switching conversations
      liveMessages.value = [];

      // Wait for socket to be connected before switching
      const checkConnection = () => {
        if (ws.isConnected.value) {
          const lastMessage = messages.value[messages.value.length - 1];
          if (lastMessage?.id) {
            ws.markSeen(newId, lastMessage.id);
          }
        } else {
          // retry until connected
          setTimeout(checkConnection, 200);
        }
      };

      checkConnection();
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

  ws.onError((error) => {
    showToaster('error', `Socket error: ${error}`);
  });
});

watch(messagesError, (val) => val && showToaster('error', 'Failed to load messages'));
watch(conversationsError, (val) => val && showToaster('error', 'Failed to load conversation'));
</script>
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <DmConversationHeader
      :username="conversation?.participant.username || conversationId"
      :avatar-url="conversation?.participant.avatarUrl || ''"
    />
    <div class="flex flex-1 flex-col overflow-hidden">
      <DmConversationInfo :conversation="conversation || null" class="px-4 pt-4" />
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
      />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
