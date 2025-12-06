<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();

const tweetClone = ref(structuredClone(toRaw(props.tweet)));

// Update local tweet state when like/unlike succeeds
const onLikeSuccess = () => {
  if (!tweetClone.value.isLiked) {
    tweetClone.value.isLiked = true;
    tweetClone.value.likeCount = (tweetClone.value.likeCount ?? 0) + 1;
  }
};

const onUnlikeSuccess = () => {
  if (tweetClone.value.isLiked) {
    tweetClone.value.isLiked = false;
    const next = (tweetClone.value.likeCount ?? 0) - 1;
    tweetClone.value.likeCount = next < 0 ? 0 : next;
  }
};

const onRetweetSuccess = () => {
  if (!tweetClone.value.isRetweeted) {
    tweetClone.value.isRetweeted = true;
    tweetClone.value.retweetCount += 1;
  }
};

const onUndoRetweetSuccess = () => {
  if (tweetClone.value.isRetweeted) {
    tweetClone.value.isRetweeted = false;
    const next = (tweetClone.value.retweetCount ?? 0) - 1;
    tweetClone.value.retweetCount = next < 0 ? 0 : next;
  }
};
</script>

<template>
  <article class="w-full max-w-[700px] gap-3 border-b px-4 pt-3 pb-2">
    <div class="flex w-full items-center justify-between">
      <div class="flex">
        <NuxtLink
          :to="`/profile/${props.tweet.author.username}`"
          class="flex items-center"
          @click.stop
        >
          <Avatar
            :img="tweetClone.author.avatarUrl || '/default_profile.png'"
            size="sm"
            variant="primary"
          />
          <div class="ms-2 flex flex-col">
            <span class="cursor-pointer leading-tight font-semibold hover:underline">{{
              tweetClone.author.displayName
            }}</span>
            <span class="text-muted-foreground leading-tight">
              {{ '@' + tweetClone.author.username }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
    <div class="border-b-border mt-3 border-b-1 pb-3">
      <p class="mt-1 text-lg leading-relaxed break-words whitespace-pre-wrap">
        <ContentEntitiesRenderer :content="tweetClone.content" :entities="tweetClone.entities" />
      </p>
      <TweetMedia :media="tweetClone.media" />

      <div class="mt-2">
        <time
          :title="formatDate(tweetClone.createdAt)"
          :datetime="tweetClone.createdAt"
          class="text-muted-foreground text-md"
          >{{ formatDate(tweetClone.createdAt) }}</time
        >
      </div>
    </div>
    <TweetActionButtons
      :tweet="tweetClone"
      @like-success="onLikeSuccess"
      @unlike-success="onUnlikeSuccess"
      @retweet-success="onRetweetSuccess"
      @undo-retweet-success="onUndoRetweetSuccess"
    />
  </article>
</template>
