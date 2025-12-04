<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
import Base from '~/components/notifications/Base.vue';
import { ref } from 'vue';

const notifications = ref<
  Array<{
    message: string;
    timestamp: string;
    icon: { name: string; color?: string };
    actor: ActorSummary;
    isSeen?: boolean;
  }>
>([
  {
    message: 'liked your tweet',
    timestamp: '2h ago',
    icon: { name: 'lucide:heart', color: 'text-brand-red' },
    actor: {
      username: 'habiba',
      displayName: 'Habiba Ayman',
      avatarUrl: 'https://cdn.raven.cmp27.space/avatars/691fc500-b246-4d09-a4b7-c5b33873244f.jpg',
    },
    isSeen: true,
  },
  {
    message: 'started following you',
    timestamp: '5h ago',
    icon: { name: 'lucide:user-plus', color: 'text-brand-blue' },
    actor: {
      username: 'janedoe',
      displayName: 'Jane Doe',
      avatarUrl: 'https://example.com/avatar/janedoe.jpg',
    },
  },
]);
</script>

<template>
  <div>
    <h1 class="p-4 text-2xl font-bold">{{ $t('leftsidebar.nav.notifications') }}</h1>
    <div>
      <Base
        v-for="(notification, index) in notifications"
        :key="index"
        :message="notification.message"
        :timestamp="notification.timestamp"
        :icon="notification.icon"
        :actor="notification.actor"
        :is-seen="notification.isSeen"
      />
    </div>
  </div>
</template>
