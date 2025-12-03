<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
interface Props {
  tweet: Tweet;
  isPreview?: boolean;
  sizeClass?: string;
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

function handleTweetClick() {
  if (props.isPreview) return;
  router.push(`/profile/${props.tweet.author.username}/status/${props.tweet.id}`);
}
</script>

<template>
  <article
    :id="'tweet-' + props.tweet.id"
    class="border-b-border flex w-full max-w-[700px] cursor-pointer gap-3 border-b-1 p-2"
    @click.prevent.stop="handleTweetClick"
  >
    <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
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
        <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
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
        <UiContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" :size-class="props.sizeClass" />

      <!-- Actions -->
      <TweetActionButtons
        v-if="!props.isPreview"
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
