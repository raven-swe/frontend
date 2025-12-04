<script lang="ts" setup>
import Follow from '~/components/notifications/Follow.vue';
import Like from '~/components/notifications/Like.vue';
import Repost from '~/components/notifications/Repost.vue';
import QuoteMention from '~/components/notifications/QuoteMention.vue';
import { notificationsService } from '~/services/notifications/notificationsService';
import type {
  Notification,
  ActorSummary,
  ActorSummaryContainer,
} from '~/shared/types/notifications';

definePageMeta({
  layout: 'notifications',
});

const notifications = ref<Notification[]>([]);

onMounted(async () => {
  const data = await notificationsService.getNotificationsMock();
  notifications.value = (data as Notification[]) || [];
});

function getPrimaryActor(actorSummary?: ActorSummaryContainer): ActorSummary {
  return (
    actorSummary?.previewActors?.[0] ?? {
      username: 'unknown',
      displayName: 'Unknown',
      avatarUrl: '/default_profile.png',
    }
  );
}

function componentForType(type: string) {
  switch (type) {
    case 'FOLLOW':
      return Follow;
    case 'LIKE':
      return Like;
    case 'RETWEET':
      return Repost;
    case 'REPLY':
    case 'QUOTE':
      return QuoteMention;
    case 'MENTION':
      return QuoteMention;
    default:
      return Follow;
  }
}
</script>

<template>
  <div class="divide-y">
    <div v-for="notif in notifications" :key="notif.id">
      <component
        :is="componentForType(notif.type)"
        :timestamp="notif.latestEventAt"
        :actor="getPrimaryActor(notif.actorSummary)"
        :is-seen="notif.isSeen"
        :tweet="notif.tweetSummary?.primaryTweet"
      />
    </div>
  </div>
</template>
