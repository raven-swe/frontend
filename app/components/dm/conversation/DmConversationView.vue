<script lang="ts" setup>
import DmMessagesList from './DmMessagesList.vue';
import { useRoute } from 'vue-router';
import { useDmMessages } from '@/composables/useDmMessages';

import { showToaster } from '@/utils/showToaster';
import Spinner from '~/components/ui/Spinner.vue';

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
  messages,
  loading: messagesLoading,
  error: messagesError,
} = useDmMessages(() => conversationId.value);

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
      <div
        v-if="conversationsLoading || messagesLoading"
        class="flex items-center justify-center p-4"
      >
        <Spinner size="1.5rem" />
      </div>
      <DmMessagesList v-else :messages="messages || []" />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
