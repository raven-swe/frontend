<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
const userStore = useUserStore();

const props = defineProps<{
  timestamp: string;
  actors: ActorSummary[];
  totalActorsCount: number;
  isSeen?: boolean;
}>();

const icon = {
  name: 'lucide:user-plus',
  color: 'text-brand-blue',
};

const linkTo = `/profile/${userStore.user?.username}/followers`; // should lead to a page showing the new followers
const followPluralIndex = computed(() => Math.min(props.totalActorsCount - 1, 3));

// Get up to 3 actors for display in the message
const displayActors = computed(() => props.actors.slice(0, 3));

const messageParams = computed(() => ({
  named: {
    count: Math.max(props.totalActorsCount - 2, 0),
    user1: displayActors.value[0]?.username,
    user2: displayActors.value[1]?.username,
    user3: displayActors.value[2]?.username,
  },
}));
</script>

<template>
  <NotificationsBase
    message-key="notifications.message.follow"
    :message-plural-index="followPluralIndex"
    :message-params="messageParams"
    :display-actors="displayActors"
    :timestamp="props.timestamp"
    :icon="icon"
    :actors="props.actors"
    :link-to="linkTo"
    :is-seen="props.isSeen"
  />
</template>
