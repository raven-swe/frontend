<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import Button from '~/components/ui/Button.vue';

import QuoteTweetDialog from './composer/QuoteTweetDialog.vue';
import { showToaster } from '~/utils/showToaster';
import { buildTweetLink } from '~/utils/tweetLink';
import {
  useTweetLikeMutation,
  useTweetRetweetMutation,
} from '~/composables/tweet/useTweetMutation';
import ReplyTweetDialog from './composer/ReplyTweetDialog.vue';

interface Props {
  tweet: Tweet;
}

const props = defineProps<Props>();

const showQuoteDialog = ref(false);
const showReplyDialog = ref(false);
const { mutate: likeTweet } = useTweetLikeMutation();
const { mutate: retweet } = useTweetRetweetMutation();

const handleLike = () => {
  likeTweet({ tweetId: props.tweet.id, action: 'like' });
};

const handleUnlike = () => {
  likeTweet({ tweetId: props.tweet.id, action: 'unlike' });
};

const handleRetweet = () => {
  retweet({ tweetId: props.tweet.id, action: 'retweet' });
};

const handleUndoRetweet = () => {
  retweet({ tweetId: props.tweet.id, action: 'undo-retweet' });
};

const copyLink = async (link: string) => {
  await navigator.clipboard.writeText(link);
  showToaster('success', 'Link copied to clipboard');
};

const handleShare = async () => {
  const link = buildTweetLink(props.tweet.author.username, props.tweet.id);

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Check out this tweet', url: link });
      showToaster('success', 'Shared successfully');
      return;
    }

    await copyLink(link);
  } catch (err) {
    // User cancelled share UI then do nothing
    if ((err as DOMException)?.name === 'AbortError') return; // common for share cancel [web:21]

    // Share failed or clipboard failed try clipboard as fallback
    try {
      await copyLink(link);
    } catch {
      showToaster('error', 'Failed to share or copy link');
    }
  }
};
</script>

<template>
  <div class="text-muted-foreground text-md mt-1.5 flex w-full items-center justify-between">
    <label class="hover:text-brand-blue relative flex items-center justify-center gap-[1px]">
      <Button
        variant="tweet-icon-turquoise"
        size="icon-md"
        data-cy="tweet-reply-button"
        @click.stop
        @click="showReplyDialog = true"
      >
        <Icon name="tabler:message-circle-2" size="1.2rem" />
      </Button>
      <span class="absolute start-8" data-cy="tweet-reply-count">{{ props.tweet.replyCount }}</span>
    </label>

    <label
      :class="[
        'relative flex items-center justify-center gap-[1px]',
        props.tweet.isRetweeted
          ? 'hover:text-brand-turquoise text-brand-turquoise'
          : 'hover:text-brand-turquoise',
      ]"
    >
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <Button
            :variant="
              props.tweet.isRetweeted ? 'tweet-icon-turquoise-active' : 'tweet-icon-turquoise'
            "
            size="icon-md"
            data-testid="retweet-dropdown-trigger"
            data-cy="tweet-retweet-button"
            @click.stop
          >
            <Icon name="tabler:repeat" size="1.2rem" />
          </Button>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="center">
          <UiDropdownMenuItem
            data-testid="retweet-action-item"
            data-cy="tweet-retweet-action"
            @click.prevent.stop="props.tweet.isRetweeted ? handleUndoRetweet() : handleRetweet()"
          >
            <Icon name="tabler:repeat" size="18" />
            {{
              props.tweet.isRetweeted ? $t('tweet.actions.unrepost') : $t('tweet.actions.repost')
            }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem
            data-testid="quote-action-item"
            data-cy="tweet-quote-action"
            @click="showQuoteDialog = true"
          >
            <Icon name="tabler:pencil" size="18" />
            {{ $t('tweet.actions.quote') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
      <span class="absolute start-8" data-cy="tweet-retweet-count">{{
        props.tweet.retweetCount
      }}</span>
    </label>

    <label
      v-if="props.tweet.isLiked"
      class="hover:text-brand-red text-brand-red relative flex items-center justify-center"
    >
      <Button
        variant="tweet-icon-red-active"
        size="icon-md"
        data-cy="tweet-unlike-button"
        @click.prevent.stop="handleUnlike"
      >
        <Icon name="line-md:heart-filled" size="1.2rem" />
      </Button>
      <span class="absolute start-8" data-cy="tweet-likes-count">{{ props.tweet.likeCount }}</span>
    </label>

    <label v-else class="hover:text-brand-red relative flex items-center justify-center gap-[1px]">
      <Button
        variant="tweet-icon-red"
        size="icon-md"
        data-cy="tweet-like-button"
        @click.prevent.stop="handleLike"
        @click.stop
      >
        <Icon name="tabler:heart" size="1.2rem" />
      </Button>
      <span class="absolute start-8" data-cy="tweet-likes-count">{{ props.tweet.likeCount }}</span>
    </label>

    <Button
      variant="tweet-icon-blue"
      size="icon-md"
      class="hover:text-brand-blue"
      data-cy="tweet-share-button"
      @click.prevent.stop="handleShare"
      @click.stop
    >
      <Icon name="lucide:share" size="1.2rem" />
    </Button>

    <!-- Place dialog outside dropdown structure -->
    <QuoteTweetDialog v-model:open="showQuoteDialog" :quote-to-tweet="props.tweet" />
    <ReplyTweetDialog v-model:open="showReplyDialog" :reply-tweet="props.tweet" />
  </div>
</template>
