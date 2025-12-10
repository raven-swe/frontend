<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import TweetQuoteCard from '../tweet/TweetQuoteCard.vue';

const props = defineProps<{
  timestamp: string;
  actor: ActorSummary;
  isSeen?: boolean;
  tweet: Tweet;
}>();

const icon = {
  name: 'tabler:repeat',
  color: 'text-brand-turquoise',
};

const linkTo = `/profile/${props.tweet.author.username}}/status/${props.tweet.id}`;

const message = $t('notifications.message.repost');
</script>

<template>
  <NotificationsBase
    :message="message"
    :timestamp="props.timestamp"
    :icon="icon"
    :actor="props.actor"
    :link-to="linkTo"
    :is-seen="props.isSeen"
  >
    <TweetQuoteCard :tweet="props.tweet" class="mt-2" />
  </NotificationsBase>
</template>
