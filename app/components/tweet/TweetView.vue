<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
import QuotedTweetCard from './QuotedTweetCard.vue';
interface Props {
  tweet: TweetWithParents;
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

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
</script>

<template>
  <article class="w-full max-w-[700px] gap-3 border-b px-4 pb-2">
    <div class="flex w-full flex-col gap-1">
      <div class="flex flex-row gap-2">
        <div class="relative flex flex-col items-center gap-1">
          <div
            class="h-2 w-0.5 shrink-0"
            :class="{
              'bg-thread-foreground': tweetClone.rootTweet,
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
        <div class="flex w-full items-start justify-between">
          <div class="flex h-full flex-col justify-end">
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
          <div class="relative">
            <TweetDropdown :tweet="props.tweet">
              <UiButton
                variant="ghost-default"
                size="icon-xs"
                class="text-muted-foreground absolute end-0 top-2 translate-x-2.5"
                @click.stop
              >
                <Icon name="lucide:more-horizontal" />
              </UiButton>
            </TweetDropdown>
          </div>
        </div>
      </div>
    </div>
    <div class="border-b-border border-b-1">
      <p class="pt-2 text-lg leading-relaxed break-words whitespace-pre-wrap">
        <ContentEntitiesRenderer :content="tweetClone.content" :entities="tweetClone.entities" />
      </p>
      <TweetMedia :media="tweetClone.media" />

      <!-- Quoted Tweet -->
      <QuotedTweetCard v-if="tweetClone.quotedTweet" :tweet="tweetClone.quotedTweet" />

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
