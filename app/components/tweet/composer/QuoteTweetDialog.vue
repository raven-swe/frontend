<script setup lang="ts">
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  open?: boolean;
  quoteToTweet: Tweet;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'quote-success': [];
}>();

const onQuoteSuccess = () => {
  emit('quote-success');
  emit('update:open', false);
};

const localOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
});
</script>

<template>
  <UiDialog v-model:open="localOpen">
    <UiDialogContent class="h-auto max-w-lg" content-height="h-auto max-h-[95vh]">
      <TweetComposer :quote-to-tweet-id="quoteToTweet.id" type="quote" @posted="onQuoteSuccess">
        <template #reposted-tweet>
          <div class="border-foreground/15 rounded-lg border-1">
            <TweetDefaultCard
              :tweet="quoteToTweet"
              :is-preview="true"
              size-class="rounded-md h-60"
            />
          </div>
        </template>
      </TweetComposer>
    </UiDialogContent>
  </UiDialog>
</template>
