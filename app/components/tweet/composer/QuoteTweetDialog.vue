<script setup lang="ts">
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  open?: boolean;
  replyToTweet: Tweet;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const localOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
});
</script>

<template>
  <UiDialog v-model:open="localOpen" class="h[500]">
    <UiDialogContent class="h-auto max-w-lg" content-height="h-auto max-h-[90vh]">
      <TweetComposer :reply-to-tweet-id="replyToTweet.id" @posted="emit('update:open', false)">
        <template #reposted-tweet>
          <div class="border-foreground/15 rounded-lg border-1">
            <TweetDefaultCard
              :tweet="replyToTweet"
              :is-preview="true"
              size-class="rounded-md h-50"
            />
          </div>
        </template>
      </TweetComposer>
    </UiDialogContent>
  </UiDialog>
</template>
