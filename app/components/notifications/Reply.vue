<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
import type { Tweet } from '~~/shared/types/tweets';
import TweetQuoteCard from '../tweet/TweetQuoteCard.vue';

const props = defineProps<{
  timestamp: string;
  actors: ActorSummary[];
  isSeen?: boolean;
  tweet: Tweet;
}>();

const icon = {
  name: 'lucide:reply',
  color: 'text-brand-turquoise',
};

const linkTo = `/profile/${props.tweet.author.username}/status/${props.tweet.id}`;

const displayActors = computed(() => props.actors.slice(0, 1));

const messageParams = computed(() => ({
  named: {
    user1: props.actors[0]?.username,
  },
}));
</script>

<template>
  <NotificationsBase
    message-key="notifications.message.reply"
    :message-params="messageParams"
    :display-actors="displayActors"
    :timestamp="props.timestamp"
    :icon="icon"
    :actors="props.actors"
    :link-to="linkTo"
    :is-seen="props.isSeen"
  >
    <TweetQuoteCard :tweet="props.tweet" class="mt-2" />
  </NotificationsBase>
</template>
