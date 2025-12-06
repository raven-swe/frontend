<script setup lang="ts">
import { ref } from 'vue';
import Avatar from '~/components/ui/Avatar.vue';
import type { Tweet } from '~~/shared/types/tweets';
import TweetMedia from './TweetMedia.vue';
import TweetActionButtons from './TweetActionButtons.vue';
import TweetQuoteCard from './TweetQuoteCard.vue';
import { tweetAiSummary } from '~/services/tweet/tweetsService';
interface Props {
  tweet: Tweet;
}
const props = defineProps<Props>();
const router = useRouter();

// Format createdAt to a short relative time like "6h", "3d", "2m"
const tweet = ref<Tweet>(JSON.parse(JSON.stringify(props.tweet)));
const aiSummary = ref<string | null>(null);
const showAiSummary = ref(false);
const aiSummaryLoading = ref(false);
const aiSummaryError = ref(false);

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

async function handleAiSummary() {
  try {
    aiSummaryLoading.value = true;
    aiSummaryError.value = false;
    const res = await tweetAiSummary(props.tweet.id);
    if (res.success && res.data.summary) {
      aiSummary.value = res.data.summary;
      showAiSummary.value = true;
    } else {
      showAiSummary.value = false;
    }
  } catch (error) {
    console.error('Error fetching AI summary:', error);
    aiSummaryError.value = true;
  } finally {
    aiSummaryLoading.value = false;
  }
}

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
      <div class="flex flex-wrap items-center justify-between gap-x-1 text-sm">
        <div class="flex">
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
        <div class="flex flex-row items-center gap-2">
          <Button
            variant="tweet-icon-blue"
            size="icon-md"
            class="hover:text-brand-blue"
            @click.prevent.stop="handleAiSummary"
          >
            <Icon name="vscode-icons:file-type-gemini" size="1.2rem" />
          </Button>
          <Icon
            class="text-foreground/50 hover:text-primary cursor-pointer"
            name="ic:more-horiz"
            size="1.4rem"
          />
        </div>
      </div>

      <!-- Content -->
      <p class="mt-1 leading-relaxed break-words whitespace-pre-wrap">
        <UiContentEntitiesRenderer :content="tweet.content" :entities="tweet.entities" />
      </p>

      <!-- Media (single image basic layout) -->
      <TweetMedia :media="tweet.media" />

      <!-- Quoted Tweet -->
      <TweetQuoteCard v-if="tweet.quotedTweet" :tweet="tweet.quotedTweet" />

      <div class="mt-2">
        <!-- Skeleton shimmer while loading -->
        <div v-if="aiSummaryLoading" class="ai-summary-bg ai-summary-anim space-y-2 rounded-xl p-3">
          <div class="skeleton-shimmer h-3 w-10/12 rounded"></div>
          <div class="skeleton-shimmer h-3 w-9/12 rounded"></div>
          <div class="skeleton-shimmer h-3 w-7/12 rounded"></div>
        </div>

        <!-- Error state with icon and retry -->
        <div
          v-else-if="true"
          class="ai-summary-bg ai-summary-anim flex items-center gap-2 rounded-xl p-3"
        >
          <Icon
            name="material-symbols:error-outline-rounded"
            class="text-destructive"
            size="1.2rem"
            aria-hidden="true"
          />
          <span class="text-foreground/80 text-sm">{{
            $t?.('ai-summary.something-went-wrong')
          }}</span>
          <Button
            variant="primary"
            size="sm"
            class="border-ring text-foreground/80 hover:bg-accent/50 ms-auto flex items-center rounded-md border px-3 py-1"
            @click.prevent.stop="handleAiSummary"
          >
            <Icon
              name="material-symbols:refresh-rounded"
              class="me-1"
              size="1rem"
              aria-hidden="true"
            ></Icon>
            {{ $t?.('ai-summary.retry') }}
          </Button>
        </div>

        <!-- Summary content -->
        <div v-else-if="showAiSummary" class="ai-summary-bg ai-summary-anim rounded-xl p-3">
          <h3>
            {{ $t?.('ai-summary.summary') }}
          </h3>
          <p class="text-foreground text-sm">{{ aiSummary }}</p>
        </div>
      </div>

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
<style scoped>
.ai-summary-bg {
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    color-mix(in oklch, var(--brand-blue) 18%, var(--accent)) 30%,
    color-mix(in oklch, var(--brand-turquoise) 18%, var(--accent)) 60%,
    var(--accent) 100%
  );
  background-size: 200% 200%;
}

@keyframes aiGradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.ai-summary-anim {
  animation: aiGradientShift 3s ease-in-out infinite;
}

/* Shimmer skeleton using gradient and animation */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: transparent; /* let the AI gradient show through */
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in oklch, var(--ring-primary) 25%, transparent) 45%,
    color-mix(in oklch, var(--ring-primary) 35%, transparent) 50%,
    color-mix(in oklch, var(--ring-primary) 25%, transparent) 55%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: skeletonSweep 1.4s ease-in-out infinite;
  mix-blend-mode: lighten;
  opacity: 0.6;
}
@keyframes skeletonSweep {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
