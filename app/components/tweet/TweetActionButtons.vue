<script setup lang="ts">
import type { Tweet } from '~~/shared/types/tweets';
import Button from '~/components/ui/Button.vue';
import {
  likeTweet,
  retweetTweet,
  unLikeTweet,
  undoRetweetTweet,
} from '~/services/tweet/actionButtonsService';
import QuoteTweetDialog from './composer/QuoteTweetDialog.vue';
import { showToaster } from '~/utils/showToaster';
import { buildTweetLink } from '~/utils/tweetLink';

interface Props {
  tweet: Tweet;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'like-success' | 'unlike-success' | 'retweet-success' | 'undo-retweet-success'): void;
}>();

const pendingLike = ref(false);
const showQuoteDialog = ref(false);

const handleLike = async () => {
  if (pendingLike.value) return;
  pendingLike.value = true;
  emit('like-success');
  try {
    const res = await likeTweet(props.tweet.id);
    if (!res?.success) emit('unlike-success');
  } catch (err) {
    emit('unlike-success');
    console.error('like failed', err);
  } finally {
    pendingLike.value = false;
  }
};

const handleUnlike = async () => {
  if (pendingLike.value) return;
  pendingLike.value = true;
  emit('unlike-success');
  try {
    const res = await unLikeTweet(props.tweet.id);
    if (!res?.success) emit('like-success');
  } catch (err) {
    emit('like-success');
    console.error('unlike failed', err);
  } finally {
    pendingLike.value = false;
  }
};

const pendingRetweet = ref(false);

const handleRetweet = async () => {
  if (pendingRetweet.value) return;
  pendingRetweet.value = true;
  emit('retweet-success');
  try {
    const res = await retweetTweet(props.tweet.id);
    if (!res?.success) {
      emit('undo-retweet-success');
    }
  } catch (err) {
    emit('undo-retweet-success');
    console.error('retweet failed', err);
  } finally {
    pendingRetweet.value = false;
  }
};

const handleUndoRetweet = async () => {
  if (pendingRetweet.value) return;
  pendingRetweet.value = true;
  emit('undo-retweet-success');
  try {
    const res = await undoRetweetTweet(props.tweet.id);
    if (!res?.success) {
      emit('retweet-success');
    }
  } catch (err) {
    emit('retweet-success');
    console.error('undo retweet failed', err);
  } finally {
    pendingRetweet.value = false;
  }
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
          >
            <Icon name="tabler:repeat" size="1.2rem" />
          </Button>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent align="center">
          <UiDropdownMenuItem
            @click.prevent.stop="props.tweet.isRetweeted ? handleUndoRetweet() : handleRetweet()"
          >
            <Icon name="tabler:repeat" size="18" />
            {{
              props.tweet.isRetweeted ? $t('tweet.actions.unrepost') : $t('tweet.actions.repost')
            }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="showQuoteDialog = true">
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
    <QuoteTweetDialog v-model:open="showQuoteDialog" />
  </div>
</template>
