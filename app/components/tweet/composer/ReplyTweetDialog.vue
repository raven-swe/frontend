<script setup lang="ts">
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  open?: boolean;
  replyTweet: Tweet;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'reply-success': [tweet: Tweet];
}>();

const onReplySuccess = (tweet: Tweet) => {
  emit('reply-success', tweet);
  emit('update:open', false);
};

const localOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
});
</script>

<template>
  <UiDialog v-model:open="localOpen">
    <UiDialogContent class="h-auto max-w-lg p-0" content-height="h-auto max-h-[95vh]">
      <TweetDefaultCard :tweet="replyTweet" is-root no-actions />
      <TweetComposer :reply-to-tweet-id="replyTweet.id" type="reply" @posted="onReplySuccess">
      </TweetComposer>
    </UiDialogContent>
  </UiDialog>
</template>
