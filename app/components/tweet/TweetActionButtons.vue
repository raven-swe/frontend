<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import Button from '~/components/ui/Button.vue';

import QuoteTweetDialog from './composer/QuoteTweetDialog.vue';
import { showToaster } from '~/utils/showToaster';
import { buildTweetLink } from '~/utils/tweetLink';

interface Props {
  tweet: Tweet;
}

const props = defineProps<Props>();
const showQuoteDialog = ref(false);
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

const handleShare = async () => {
  try {
    const link = buildTweetLink(props.tweet.author.username, props.tweet.id);
    await navigator.clipboard.writeText(link);
    showToaster('success', 'Link copied to clipboard');
  } catch (err) {
    console.error('share copy failed', err);
    showToaster('error', 'Failed to copy link');
  }
};
</script>

<template>
  <div class="text-muted-foreground text-md mt-1.5 flex w-full items-center justify-between">
    <label class="hover:text-brand-blue relative flex items-center justify-center gap-[1px]">
      <Button variant="tweet-icon-turquoise" size="icon-md">
        <Icon name="tabler:message-circle-2" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.replyCount }}</span>
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
          >
            <Icon name="tabler:repeat" size="1.2rem" />
          </Button>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="center">
          <UiDropdownMenuItem
            data-testid="retweet-action-item"
            @click.prevent.stop="props.tweet.isRetweeted ? handleUndoRetweet() : handleRetweet()"
          >
            <Icon name="tabler:repeat" size="18" />
            {{
              props.tweet.isRetweeted ? $t('tweet.actions.unrepost') : $t('tweet.actions.repost')
            }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem data-testid="quote-action-item" @click="showQuoteDialog = true">
            <Icon name="tabler:pencil" size="18" />
            {{ $t('tweet.actions.quote') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
      <span class="absolute start-8">{{ props.tweet.retweetCount }}</span>
    </label>

    <label
      v-if="props.tweet.isLiked"
      class="hover:text-brand-red text-brand-red relative flex items-center justify-center"
    >
      <Button variant="tweet-icon-red-active" size="icon-md" @click.prevent.stop="handleUnlike">
        <Icon name="line-md:heart-filled" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.likeCount }}</span>
    </label>

    <label v-else class="hover:text-brand-red relative flex items-center justify-center gap-[1px]">
      <Button variant="tweet-icon-red" size="icon-md" @click.prevent.stop="handleLike">
        <Icon name="tabler:heart" size="1.2rem" />
      </Button>
      <span class="absolute start-8">{{ props.tweet.likeCount }}</span>
    </label>

    <Button
      variant="tweet-icon-blue"
      size="icon-md"
      class="hover:text-brand-blue"
      @click.prevent.stop="handleShare"
    >
      <Icon name="lucide:share" size="1.2rem" />
    </Button>

    <!-- Place dialog outside dropdown structure -->
    <QuoteTweetDialog v-model:open="showQuoteDialog" :quote-to-tweet="props.tweet" />
  </div>
</template>
