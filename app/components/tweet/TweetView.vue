<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
interface Props {
  tweet: Tweet;
  media?: boolean;
}
const props = defineProps<Props>();
const showMedia = computed(() => props.media ?? true);

const tweet = ref(props.tweet);

// Update local tweet state when like/unlike succeeds
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
</script>

<template>
  <article class="border-b-border w-full max-w-[700px] gap-3 border-b-1 p-4">
    <div class="flex w-full items-center justify-between">
      <div class="flex">
        <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
          <Avatar
            :img="tweet.author.avatarUrl || '/default_profile.png'"
            size="sm"
            variant="primary"
          />
        </NuxtLink>

        <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
          <div class="ms-2 flex flex-col">
            <span class="cursor-pointer font-semibold hover:underline">{{
              tweet.author.displayName
            }}</span>
            <span class="text-muted-foreground" v-text="'@' + tweet.author.username" />
          </div>
        </NuxtLink>
      </div>
      <div class="flex">
        <Icon
          class="text-foreground/50 hover:text-primary cursor-pointer"
          name="ic:more-horiz"
          size="1.4rem"
        />
      </div>
    </div>
    <div class="border-b-border mt-3 border-b-1 pb-3">
      <p class="mt-1 leading-relaxed break-words whitespace-pre-wrap">
        <ContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
      </p>
      <div v-if="showMedia">
        <!-- Media (single image basic layout) -->
        <TweetMedia :media="tweet.media" :tweet-id="tweet.id" />
      </div>

      <div class="mt-2">
        <time
          :title="formatDate(tweet.createdAt)"
          :datetime="tweet.createdAt"
          class="text-muted-foreground hover:cursor-pointer hover:underline"
          >{{ formatDate(tweet.createdAt) }}</time
        >
      </div>
    </div>
    <TweetActionButtons
      :tweet="tweet"
      @like-success="onLikeSuccess"
      @unlike-success="onUnlikeSuccess"
      @retweet-success="onRetweetSuccess"
      @undo-retweet-success="onUndoRetweetSuccess"
    />
  </article>
</template>
