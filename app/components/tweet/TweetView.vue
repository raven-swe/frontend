<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
import { useUserStore } from '~/stores/user';
import QuotedTweetCard from './QuotedTweetCard.vue';
import AiSummary from './AiSummary.vue';
interface Props {
  tweet: TweetWithParents;
}
const props = defineProps<Props>();
const userStore = useUserStore();
const originalUsername = ref<string>(userStore.user?.username || '');

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
  <NuxtLink
    v-if="props.tweet.repostedBy"
    :to="`/profile/${props.tweet.repostedBy.username}`"
    class="text-muted-foreground ms-2 mt-13 flex items-center gap-1 px-6"
  >
    <Icon name="tabler:repeat" size="1.2rem" />
    <span
      v-if="props.tweet.repostedBy.username === originalUsername"
      class="text-muted-foreground text-sm"
    >
      {{ $t('tweet.retweeted-by-you') }}
    </span>
    <span v-else class="text-muted-foreground text-sm">{{
      $t('tweet.retweeted-by', { username: props.tweet.repostedBy.displayName })
    }}</span>
  </NuxtLink>
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
            <div class="absolute end-0 top-1/2 flex translate-x-2.5 flex-row items-center">
              <UiButton
                variant="ghost-default"
                size="icon-sm"
                class="text-muted-foreground"
                :disabled="!tweetClone.content || tweetClone.content.trim().length === 0"
                @click.stop="handleAiSummary"
              >
                <Icon name="vscode-icons:file-type-gemini" size="1.2rem" />
              </UiButton>
              <TweetDropdown :tweet="props.tweet" :username="originalUsername">
                <UiButton
                  variant="ghost-default"
                  size="icon-xs"
                  class="text-muted-foreground"
                  @click.stop
                >
                  <Icon name="lucide:more-horizontal" />
                </UiButton>
              </TweetDropdown>
            </div>
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
