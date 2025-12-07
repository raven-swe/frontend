<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import QuotedTweetCard from './QuotedTweetCard.vue';
interface Props {
  tweet: Tweet;
  isParent?: boolean;
  isRoot?: boolean;
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
  router.push(`/profile/${props.tweet.author.username}/status/${props.tweet.id}`);
}
</script>

<template>
  <article
    :id="'tweet-' + props.tweet.id"
    class="border-b-border bg-background hover:bg-foreground/5 flex w-full max-w-[700px] cursor-pointer gap-2 px-4 transition-colors duration-100"
    :class="{
      'border-b-1': !isParent && !isRoot,
    }"
    @click.prevent.stop="handleTweetClick"
  >
    <div class="flex flex-col items-center gap-1">
      <div
        class="h-2 w-0.5 shrink-0"
        :class="{
          'bg-thread-foreground': isParent,
        }"
      ></div>
      <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
        <Avatar
          :img="props.tweet.author.avatarUrl || '/default_profile.png'"
          size="sm"
          variant="primary"
        />
      </NuxtLink>
      <div v-if="isParent || isRoot" class="bg-thread-foreground h-full w-0.5"></div>
    </div>

    <!-- Main -->
    <div class="min-w-0 flex-1 pt-3 pb-2">
      <!-- Header: display name, username, time -->
      <div class="flex flex-wrap items-center gap-x-1 text-sm">
        <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
          <span class="cursor-pointer font-semibold hover:underline">{{
            props.tweet.author.displayName
          }}</span>
          <span class="text-muted-foreground ms-1" v-text="'@' + props.tweet.author.username" />
        </NuxtLink>
        <span class="text-muted-foreground">·</span>
        <time
          :title="formatDate(tweet.createdAt, $i18n.locale)"
          :datetime="tweet.createdAt"
          class="text-muted-foreground hover:cursor-pointer hover:underline"
          >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
        >
      </div>

      <!-- Content -->
      <p class="leading-relaxed break-words whitespace-pre-wrap">
        <UiContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" />

      <!-- Quoted Tweet -->

      <QuotedTweetCard v-if="tweet.quotedTweet" :tweet="tweet.quotedTweet" />

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
