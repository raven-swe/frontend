<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
import QuotedTweetCard from './QuotedTweetCard.vue';
import AiSummary from './AiSummary.vue';
interface Props {
  tweet: TweetWithParents;
}
const props = defineProps<Props>();

const tweetClone = ref(structuredClone(toRaw(props.tweet)));
const aiSummaryRef = ref<InstanceType<typeof AiSummary> | null>(null);
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

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();

function handleAiSummary() {
  aiSummaryRef.value?.handleAiSummary?.();
}
</script>

<template>
  <article class="w-full max-w-[700px] gap-3 border-b px-4 pb-2">
    <div class="flex w-full flex-col gap-1">
      <div class="flex flex-row gap-2">
        <div class="relative flex flex-col items-center gap-1">
          <div
            class="h-2 w-0.5"
            :class="{
              'bg-thread-foreground': !!tweet.rootTweet,
            }"
          ></div>
          <UserHoverCard
            :username="props.tweet.author.username"
            @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
            @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
            @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
            @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
          >
            <NuxtLink :to="`/profile/${props.tweet.author.username}`" @click.stop>
              <Avatar
                :img="tweetClone.author.avatarUrl || '/default_profile.png'"
                size="sm"
                variant="primary"
                class="shrink-0"
              />
            </NuxtLink>
          </UserHoverCard>
        </div>
        <div class="flex flex-col justify-end">
          <UserHoverCard
            :username="props.tweet.author.username"
            @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
            @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
            @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
            @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
          >
            <NuxtLink
              :to="`/profile/${props.tweet.author.username}`"
              class="cursor-pointer leading-tight font-semibold hover:underline"
              @click.stop
            >
              {{ tweetClone.author.displayName }}
            </NuxtLink>
          </UserHoverCard>
          <UserHoverCard
            :username="props.tweet.author.username"
            @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
            @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
            @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
            @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
          >
            <NuxtLink
              :to="`/profile/${props.tweet.author.username}`"
              class="text-muted-foreground leading-tight"
              @click.stop
            >
              {{ '@' + tweetClone.author.username }}
            </NuxtLink>
          </UserHoverCard>
        </div>
        <UiButton
          variant="ghost-default"
          size="icon-sm"
          class="text-foreground/70 hover:text-foreground ms-auto"
          @click.stop="handleAiSummary"
        >
          <Icon name="vscode-icons:file-type-gemini" size="1.2rem" />
        </UiButton>
      </div>
    </div>
    <div class="border-b-border border-b-1">
      <p class="pt-2 text-lg leading-relaxed break-words whitespace-pre-wrap">
        <ContentEntitiesRenderer :content="tweetClone.content" :entities="tweetClone.entities" />
      </p>
      <TweetMedia :media="tweetClone.media" />

      <!-- Quoted Tweet -->
      <QuotedTweetCard v-if="tweetClone.quotedTweet" :tweet="tweetClone.quotedTweet" />

      <AiSummary ref="aiSummaryRef" :tweet-id="props.tweet.id" />
      <div class="py-2">
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
