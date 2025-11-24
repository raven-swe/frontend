<script lang="ts" setup>
import DmMessagesList from './DmMessagesList.vue';
import { useRoute } from 'vue-router';
import { useDmMessages } from '@/composables/useDmMessages';

import { useDmSocketIO } from '@/composables/useDmSocketIO';
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
  return conversations.value.find((c) => c.id === conversationId.value) || null;
});

const {
  messages: initialMessages,
  loading: messagesLoading,
  error: messagesError,
} = useDmMessages(() => conversationId.value);

const ws = useDmSocketIO();
provide('dmSocket', ws);
const liveMessages = ref<DmMessage[]>([]);

const messages = computed(() => {
  const initial = initialMessages.value || [];
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
          ws.switchConversation(newId, lastMessage?.id);
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

// Handle incoming Socket.IO messages
onMounted(() => {
  ws.onMessage((message) => {
    if (conversationId.value && message) {
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
    <div class="flex-1 overflow-y-auto p-4">
      <DmConversationInfo :conversation="conversation || null" />
      <div v-if="conversationsLoading || messagesLoading" class="p-4">
        <Spinner size="1.5rem" />
      </div>
      <DmMessagesList v-else :messages="messages" />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
