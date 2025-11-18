<script lang="ts" setup>
import type { DmConversation } from '~/../shared/types/dm';

const selectedConversationId = ref<string | null>(null);

const selectConversation = (id: string) => {
  selectedConversationId.value = id;
};

const conversations: DmConversation[] = [
  {
    id: '1',
    participant: {
      username: '@hussein',
      displayName: 'Hussein',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    lastMessage: {
      content: 'Hey! How are you doing?',
      senderUsername: '@hussein',
      sentAt: '2h',
    },
    isMuted: false,
  },
  {
    id: '2',
    participant: {
      username: '@btngana',
      displayName: 'Ahmed Amr',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
    lastMessage: {
      content: 'Did you see the new update?',
      senderUsername: '@btngana',
      sentAt: '5h',
    },
    isMuted: false,
  },
  {
    id: '3',
    participant: {
      username: '@farag',
      displayName: 'Abdullah Farag',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
    },
    lastMessage: {
      content: 'Thanks for your help yesterday!',
      senderUsername: '@farag',
      sentAt: '1d',
    },
    isMuted: true,
  },
  {
    id: '4',
    participant: {
      username: '@mostafa',
      displayName: 'Mostafa Hassan',
      avatarUrl: 'https://i.pravatar.cc/150?img=13',
    },
    lastMessage: {
      content: "Let's catch up soon",
      senderUsername: '@mostafa',
      sentAt: '2d',
    },
    isMuted: false,
  },
  {
    id: '5',
    participant: {
      username: '@habiba',
      displayName: 'Habiba Ayman',
      avatarUrl: 'https://i.pravatar.cc/150?img=10',
    },
    lastMessage: {
      content: 'The meeting is at 3 PM',
      senderUsername: '@habiba',
      sentAt: '3d',
    },
    isMuted: false,
  },
];
</script>

<template>
  <div class="flex flex-col">
    <DmConversationItem
      v-for="conversation in conversations"
      :key="conversation.id"
      :conversation="conversation"
      :is-selected="selectedConversationId === conversation.id"
      class="hover:bg-foreground/5 cursor-pointer"
      @click="selectConversation(conversation.id)"
    />
  </div>
</template>
