<script setup lang="ts">
import { ref, computed } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import { parseContentEntities } from '~/utils/contentEntityParser';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
const router = useRouter();

// Format createdAt to a short relative time like "6h", "3d", "2m"
const tweet = ref<Tweet>(JSON.parse(JSON.stringify(props.tweet)));

const onLikeSuccess = () => {
  if (!tweet.value.isLiked) {
    tweet.value.isLiked = true;
    tweet.value.likeCount = (tweet.value.likeCount ?? 0) + 1;
  }
};

const onUnlikeSuccess = () => {
  if (tweet.value.isLiked) {
    tweet.value.isLiked = false;
    const next = (tweet.value.likeCount ?? 0) - 1;
    tweet.value.likeCount = next < 0 ? 0 : next;
  }
};
const onRetweetSuccess = () => {
  if (!tweet.value.isRetweeted) {
    tweet.value.isRetweeted = true;
    tweet.value.retweetCount += 1;
  }
};

const onUndoRetweetSuccess = () => {
  if (tweet.value.isRetweeted) {
    tweet.value.isRetweeted = false;
    const next = (tweet.value.retweetCount ?? 0) - 1;
    tweet.value.retweetCount = next < 0 ? 0 : next;
  }
};

const contentSegments = computed(() => {
  return parseContentEntities(tweet.value.content, tweet.value.entities);
});

function handleTweetClick() {
  router.push(`/profile/${props.tweet.author.username}/status/${props.tweet.id}`);
}
</script>

<template>
  <article
    :id="'tweet-' + props.tweet.id"
    class="border-b-border flex w-full max-w-[700px] cursor-pointer gap-3 border-b-1 p-2"
    @click.prevent.stop="handleTweetClick"
  >
    <NuxtLink :to="`/profile/${props.tweet.author.username}`">
      <Avatar
        :img="props.tweet.author.avatarUrl || '/default_profile.png'"
        size="sm"
        variant="primary"
      />
    </NuxtLink>

    <!-- Main -->
    <div class="min-w-0 flex-1">
      <!-- Header: display name, username, time -->
      <div class="flex flex-wrap items-center gap-x-1 text-sm">
        <NuxtLink :to="`/profile/${props.tweet.author.username}`">
          <span class="cursor-pointer font-semibold hover:underline">{{
            props.tweet.author.displayName
          }}</span>
          <span class="text-muted-foreground ms-1" v-text="'@' + props.tweet.author.username" />
          <span class="text-muted-foreground">·</span>
        </NuxtLink>
        <time
          :title="formatDate(tweet.createdAt, $i18n.locale)"
          :datetime="tweet.createdAt"
          class="text-muted-foreground hover:cursor-pointer hover:underline"
          >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
        >
      </div>

      <!-- Content -->
      <p class="mt-1 leading-relaxed break-words whitespace-pre-wrap">
        <template v-for="token in contentSegments" :key="token.key">
          <span v-if="token.type === 'text'" :key="token.key">
            {{ token.display }}
          </span>
          <NuxtLink
            v-else-if="token.type === 'mention'"
            :to="`/profile/${token.value}`"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </NuxtLink>
          <NuxtLink
            v-else-if="token.type === 'hashtag'"
            :to="`/hashtag/${token.value}`"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </NuxtLink>
          <a
            v-else-if="token.type === 'link'"
            :href="token.value"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            {{ token.display }}
          </a>
        </template>
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" />

      <!-- Actions -->
      <TweetActionButtons
        :tweet="tweet"
        @click.stop
        @like-success="onLikeSuccess"
        @unlike-success="onUnlikeSuccess"
        @retweet-success="onRetweetSuccess"
        @undo-retweet-success="onUndoRetweetSuccess"
      />
    </div>
  </article>
</template>
