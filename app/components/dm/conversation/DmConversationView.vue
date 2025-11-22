<script lang="ts" setup>
import DmMessagesList from './DmMessagesList.vue';
import { useRoute } from 'vue-router';
import { useDmMessages } from '@/composables/useDmMessages';
import { useDmConversation } from '@/composables/useDmConversation';
import { useDmWebSocket } from '@/composables/useDmWebSocket';
import { showToaster } from '@/utils/showToaster';
import Spinner from '~/components/ui/Spinner.vue';
import type { DmMessage } from '~~/shared/types/dm';

const route = useRoute();
const conversationId = computed(() => route.params.conversationId as string | null);

const {
  messages: initialMessages,
  loading: messagesLoading,
  error: messagesError,
} = useDmMessages(() => conversationId.value);
const {
  conversation,
  loading: convoLoading,
  error: convoError,
} = useDmConversation(() => conversationId.value);

const ws = useDmWebSocket();
const liveMessages = ref<DmMessage[]>([]);

const messages = computed(() => {
  const initial = initialMessages.value || [];
  return [...initial, ...liveMessages.value];
});

watch(
  conversationId,
  (newId) => {
    if (newId) {
      // Connect WebSocket if not already connected
      if (!ws.isConnected.value && !ws.isConnecting.value) {
        ws.connect();
      }

      // Reset live messages when switching conversations
      liveMessages.value = [];

      // Wait for WebSocket to be connected before switching
      const checkConnection = () => {
        if (ws.isConnected.value) {
          const lastMessage = messages.value[messages.value.length - 1];
          ws.switchConversation(newId, lastMessage?.id);
        } else if (!ws.isConnecting.value) {
          // If not connecting and not connected, try to connect
          ws.connect();
          setTimeout(checkConnection, 100);
        } else {
          // Still connecting, check again
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    }
  },
  { immediate: true },
);

// Handle incoming WebSocket messages
onMounted(() => {
  ws.onMessage((message) => {
    if (conversationId.value && message.sender) {
      liveMessages.value.push(message);
    }
  });

  ws.onError((error) => {
    showToaster('error', `WebSocket error: ${error}`);
  });
});

watch(messagesError, (val) => val && showToaster('error', 'Failed to load messages'));
watch(convoError, (val) => val && showToaster('error', 'Failed to load conversation'));

provide('dmWebSocket', ws);
</script>
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <DmConversationHeader
      :username="conversation?.participant.username || conversationId"
      :avatar-url="conversation?.participant.avatarUrl || ''"
    />
    <div class="flex-1 overflow-y-auto p-4">
      <DmConversationInfo :conversation="conversation || null" />
      <div v-if="convoLoading || messagesLoading" class="p-4"><Spinner size="1.5rem" /></div>
      <DmMessagesList v-else :messages="messages" />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
