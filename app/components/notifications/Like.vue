<script setup lang="ts">
import type { ActorSummary } from '~~/shared/types/notifications';
import type { Tweet } from '~~/shared/types/tweets';
import TweetQuoteCard from '../tweet/TweetQuoteCard.vue';
import { QueryClient } from '@tanstack/vue-query';

const props = defineProps<{
  timestamp: string;
  actors: ActorSummary[];
  totalActorsCount: number;
  isSeen?: boolean;
  tweet: Tweet;
}>();

const icon = {
  name: 'lucide:heart',
  color: 'text-brand-red',
};

const queryClient = new QueryClient();
queryClient.invalidateQueries({
  queryKey: ['user-list', props.tweet.author.username, 'tweet', props.tweet.id, 'likes'],
});

const linkTo = `/profile/${props.tweet.author.username}/status/${props.tweet.id}/likes`;
const likePluralIndex = computed(() => Math.min(props.totalActorsCount - 1, 3));

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
    message-key="notifications.message.like"
    :message-plural-index="likePluralIndex"
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
