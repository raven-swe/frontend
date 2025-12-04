<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetDefaultCard from '../tweet/TweetDefaultCard.vue';

const props = defineProps<{
  timestamp: string;
  actor: ActorSummary;
  isSeen?: boolean;
  tweet: Tweet;
}>();

const icon = {
  name: 'lucide:heart',
  color: 'text-brand-red',
};

const linkTo = `/profile/${props.tweet.author.username}}/status/${props.tweet.id}`;

const message = $t('notifications.message.like');
</script>

<template>
  <NotificationsBase
    :type="'LIKE'"
    :message="message"
    :timestamp="props.timestamp"
    :icon="icon"
    :actor="props.actor"
    :link-to="linkTo"
    :is-seen="props.isSeen"
  >
    <TweetDefaultCard :tweet="props.tweet" class="mt-2" />
  </NotificationsBase>
</template>
