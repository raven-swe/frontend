<script lang="ts" setup>
import type { DmMessage } from '#shared/types/dm';
import DmMessagesList from './DmMessagesList.vue';

const me = {
  username: 'hussein',
  displayName: 'Hussein',
  avatarUrl: 'https://i.pravatar.cc/150?img=2',
};

const other = {
  username: '@btngana',
  displayName: 'Ahmed Amr',
  avatarUrl: 'https://i.pravatar.cc/150?img=3',
};

const now = () => new Date().toISOString();

const messages: DmMessage[] = [
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: false,
  },
  {
    id: 'msg_3',
    sender: { ...me },
    content: `Great! Let’s push the latest changes. ${other.username}`,
    entities: {
      mentions: [{ username: other.username.replace(/^@/, ''), startPosition: 39 }],
      hashtags: [],
    },
    mediaUrl: null,
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_4',
    sender: { ...me },
    content: 'Check this out #update',
    entities: { mentions: [], hashtags: [{ hashtag: 'update', startPosition: 15 }] },
    mediaUrl: 'https://picsum.photos/seed/dm/300/200',
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: false,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: false,
  },
  {
    id: 'msg_1',
    sender: { ...me },
    content: 'Hey! How are you?',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: true,
  },
  {
    id: 'msg_2',
    sender: { ...other },
    content: 'I’m good! Working on the project.',
    entities: { mentions: [], hashtags: [] },
    mediaUrl: null,
    createdAt: now(),
    isMine: false,
  },
];
</script>
<template>
  <div class="flex h-full flex-col overflow-hidden">
    <DmConversationHeader :username="me.username" :avatar-url="me.avatarUrl" />
    <div class="flex-1 overflow-y-auto p-4">
      <DmConversationInfo />
      <DmMessagesList :messages="messages" />
    </div>
    <DmConversationDmMessageInput />
  </div>
</template>
