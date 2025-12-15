<script setup lang="ts">
import Avatar from '~/components/ui/Avatar.vue';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import ContentEntitiesRenderer from '../ui/ContentEntitiesRenderer.vue';
import { useUserStore } from '~/stores/user';
import QuotedTweetCard from './QuotedTweetCard.vue';
import AiSummary from './AiSummary.vue';
import { useQueryClient } from '@tanstack/vue-query';
import type { TweetWithParents } from '~~/shared/types/tweets';
interface Props {
  tweet: TweetWithParents;
  media?: boolean;
}
const props = defineProps<Props>();
const userStore = useUserStore();
const originalUsername = ref<string>(userStore.user?.username || '');
const showMedia = computed(() => props.media ?? true);

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
const onReplySuccess = (tweet: Tweet) => {
  tweetClone.value.replyCount = (tweetClone.value.replyCount ?? 0) + 1;
  handleReplied(tweet);
};

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();

function handleAiSummary() {
  aiSummaryRef.value?.handleAiSummary?.();
}

const queryClient = useQueryClient();
const router = useRouter();
const tweetid = computed(() => router.currentRoute.value.params.tweetid as string);

function handleReplied(tweet: Tweet) {
  if (tweet.replyToTweetId !== tweetid.value) return;

  queryClient.setQueryData<{
    pages: Array<ApiSuccessResponse<Tweet[]>>;
    pageParams: Array<string | null>;
  }>(['tweet-replies', tweetid.value], (old) => {
    if (!old) return old;

    const first = old.pages[0];
    if (!first) return old;

    return {
      ...old,
      pages: [
        {
          ...first,
          data: [tweet, ...first.data],
        },
        ...old.pages.slice(1),
      ],
    };
  });
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
        <div class="flex w-full items-start justify-between overflow-hidden">
          <div class="flex h-full flex-col justify-end overflow-hidden">
            <UserHoverCard
              :username="props.tweet.author.username"
              @follow="followUser({ username: props.tweet.author.username, action: 'follow' })"
              @block="blockUser({ username: props.tweet.author.username, action: 'block' })"
              @unblock="blockUser({ username: props.tweet.author.username, action: 'unblock' })"
              @unfollow="followUser({ username: props.tweet.author.username, action: 'unfollow' })"
            >
              <NuxtLink
                :to="`/profile/${props.tweet.author.username}`"
                class="cursor-pointer truncate pe-12 leading-tight hover:underline"
                data-cy="tweet-view-display-name"
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
                class="text-muted-foreground truncate pe-12 leading-tight"
                data-cy="tweet-view-username"
                @click.stop
              >
                {{ '@' + tweetClone.author.username }}
              </NuxtLink>
            </UserHoverCard>
          </div>
        </div>
        <div class="relative">
          <div class="absolute end-0 top-1 flex translate-x-2.5 flex-row items-center">
            <UiButton
              v-if="!(!tweetClone.content || tweetClone.content.trim().length === 0)"
              variant="ghost-default"
              size="icon-sm"
              class="text-muted-foreground"
              data-cy="tweet-view-ai-summary-button"
              @click.stop="handleAiSummary"
            >
              <Icon name="vscode-icons:file-type-gemini" size="1.2rem" />
            </UiButton>
            <TweetDropdown :tweet="props.tweet" :username="originalUsername" tweet-view>
              <UiButton
                variant="ghost-default"
                size="icon-xs"
                class="text-muted-foreground"
                data-cy="tweet-view-dropdown-trigger"
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
      <p
        class="pt-2 text-lg leading-relaxed break-words whitespace-pre-wrap"
        data-cy="tweet-view-content"
      >
        <ContentEntitiesRenderer :content="tweetClone.content" :entities="tweetClone.entities" />
      </p>
      <div v-if="showMedia">
        <TweetMedia :media="tweet.media" :tweet-id="tweet.id" />
      </div>

      <!-- Quoted Tweet -->
      <QuotedTweetCard v-if="tweetClone.quotedTweet" :tweet="tweetClone.quotedTweet" />

      <AiSummary ref="aiSummaryRef" :tweet-id="props.tweet.id" />
      <div class="py-2">
        <time
          :title="formatDate(tweetClone.createdAt)"
          :datetime="tweetClone.createdAt"
          class="text-muted-foreground text-md"
          data-cy="tweet-view-timestamp"
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
      @reply-success="onReplySuccess"
    />
  </article>
</template>
