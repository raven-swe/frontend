<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import QuotedTweetCard from './QuotedTweetCard.vue';
import AiSummary from './AiSummary.vue';
import { useUserStore } from '~/stores/user';
import { useTweet, useTweetReposter } from '~/composables/tweet/useTweet';
interface Props {
  tweetId: string;
  reposterId?: string | null;
  isParent?: boolean;
  isRoot?: boolean;
}
const props = defineProps<Props>();
const router = useRouter();
const userStore = useUserStore();
const originalUsername = ref<string>(userStore.user?.username || '');

const { data: tweet } = useTweet(props.tweetId);

const { data: reposter } = useTweetReposter(props.reposterId);

// Format createdAt to a short relative time like "6h", "3d", "2m"
const aiSummaryRef = ref<InstanceType<typeof AiSummary> | null>(null);

function handleAiSummary() {
  aiSummaryRef.value?.handleAiSummary?.();
}

function handleTweetClick() {
  router.push(`/profile/${tweet.value?.author.username}/status/${tweet.value?.id}`);
}

const { mutate: followUser } = useFollowMutation();
const { mutate: blockUser } = useBlockMutation();
</script>

<template>
  <!-- note that we need to change the username here to be the id once backend provide it -->
  <NuxtLink
    v-if="reposter"
    :to="`/profile/${reposter.username}`"
    class="text-muted-foreground ms-5 mt-1 flex items-center gap-2 px-6 text-sm"
  >
    <Icon name="tabler:repeat" />
    <span v-if="reposter.username === originalUsername">
      {{ $t('tweet.retweeted-by-you') }}
    </span>
    <span v-else>{{ $t('tweet.retweeted-by', { username: reposter.displayName }) }}</span>
  </NuxtLink>
  <article
    v-if="tweet"
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
      <UserHoverCard
        :username="tweet.author.username"
        @follow="followUser({ username: tweet.author.username, action: 'follow' })"
        @block="blockUser({ username: tweet.author.username, action: 'block' })"
        @unblock="blockUser({ username: tweet.author.username, action: 'unblock' })"
        @unfollow="followUser({ username: tweet.author.username, action: 'unfollow' })"
      >
        <NuxtLink :to="`/profile/${tweet.author.username}`" @click.stop>
          <Avatar
            :img="tweet.author.avatarUrl || '/default_profile.png'"
            size="sm"
            variant="primary"
          />
        </NuxtLink>
      </UserHoverCard>
      <div v-if="isParent || isRoot" class="bg-thread-foreground h-full w-0.5"></div>
    </div>

    <!-- Main -->
    <div class="min-w-0 flex-1 pt-3 pb-2">
      <!-- Header: display name, username, time -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-x-1 text-sm">
          <UserHoverCard
            :username="tweet.author.username"
            @follow="followUser({ username: tweet.author.username, action: 'follow' })"
            @block="blockUser({ username: tweet.author.username, action: 'block' })"
            @unblock="blockUser({ username: tweet.author.username, action: 'unblock' })"
            @unfollow="followUser({ username: tweet.author.username, action: 'unfollow' })"
          >
            <NuxtLink :to="`/profile/${tweet.author.username}`" @click.stop>
              <span class="cursor-pointer font-semibold hover:underline">{{
                tweet.author.displayName
              }}</span>
            </NuxtLink>
          </UserHoverCard>
          <UserHoverCard
            :username="tweet.author.username"
            @follow="followUser({ username: tweet.author.username, action: 'follow' })"
            @block="blockUser({ username: tweet.author.username, action: 'block' })"
            @unblock="blockUser({ username: tweet.author.username, action: 'unblock' })"
            @unfollow="followUser({ username: tweet.author.username, action: 'unfollow' })"
          >
            <NuxtLink :to="`/profile/${tweet.author.username}`" @click.stop>
              <span class="text-muted-foreground ms-1" v-text="'@' + tweet.author.username" />
            </NuxtLink>
          </UserHoverCard>
          <span class="text-muted-foreground">·</span>
          <time
            :title="formatDate(tweet.createdAt, $i18n.locale)"
            :datetime="tweet.createdAt"
            class="text-muted-foreground hover:cursor-pointer hover:underline"
            >{{ relativeTime(tweet.createdAt, $i18n.locale) }}</time
          >
        </div>
        <div class="relative flex items-center gap-1">
          <div
            class="absolute end-0 top-1/2 flex translate-x-2.5 -translate-y-1/2 flex-row items-center"
          >
            <UiButton
              variant="ghost-default"
              size="icon-sm"
              class="text-muted-foreground"
              @click.stop="handleAiSummary"
            >
              <Icon name="vscode-icons:file-type-gemini" size="1.2rem" />
            </UiButton>
            <TweetDropdown :tweet="tweet" :username="originalUsername">
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

      <div
        v-if="tweet.replyToTweet"
        class="text-muted-foreground mb-1 flex items-center gap-1 text-sm"
      >
        <p>
          {{ $t('tweet.replying-to') }}
        </p>
        <UserHoverCard
          v-if="tweet.replyToTweet"
          :username="tweet.replyToTweet.author.username"
          @follow="followUser({ username: tweet.replyToTweet.author.username, action: 'follow' })"
          @block="blockUser({ username: tweet.replyToTweet.author.username, action: 'block' })"
          @unblock="blockUser({ username: tweet.replyToTweet.author.username, action: 'unblock' })"
          @unfollow="
            followUser({ username: tweet.replyToTweet.author.username, action: 'unfollow' })
          "
        >
          <NuxtLink :to="`/profile/${tweet.replyToTweet.author.username}`" @click.stop>
            <span class="text-primary cursor-pointer hover:underline">{{
              '@' + tweet.replyToTweet.author.username
            }}</span>
          </NuxtLink>
        </UserHoverCard>
      </div>

      <!-- Content -->
      <p class="leading-relaxed break-words whitespace-pre-wrap">
        <UiContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" />

      <!-- Quoted Tweet -->

      <QuotedTweetCard v-if="tweet.quotedTweet" :tweet="tweet.quotedTweet" />

      <AiSummary ref="aiSummaryRef" :tweet-id="tweet.id" />

      <!-- Actions -->
      <TweetActionButtons
        :tweet="tweet"
        @click.stop
        @like-success="() => {}"
        @unlike-success="() => {}"
        @retweet-success="() => {}"
        @undo-retweet-success="() => {}"
      />
    </div>
  </article>
</template>
