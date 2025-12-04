<script setup lang="ts">
const props = defineProps<{
  timestamp: string;
  actor: ActorSummary;
  isSeen?: boolean;
}>();

const icon = {
  name: 'lucide:user-plus',
  color: 'text-brand-blue',
};

const linkTo = `/profile/@${props.actor.username}`;

const message = $t('notifications.message.follow');
</script>

<template>
  <NotificationsBase
    :type="'FOLLOW'"
    :message="message"
    :timestamp="props.timestamp"
    :icon="icon"
    :actor="props.actor"
    :link-to="linkTo"
    :is-seen="props.isSeen"
  />
</template>
