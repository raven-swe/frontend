<script setup lang="ts">
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  open?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const localOpen = computed({
  get: () => props.open ?? false,
  set: (value: boolean) => emit('update:open', value),
});

const dummyTweet: Tweet = {
  id: '168',
  author: {
    username: 'habiba',
    displayName: 'habiba',
    avatarUrl: 'https://cdn.raven.cmp27.space/avatars/691fc500-b246-4d09-a4b7-c5b33873244f.jpg',
    isBlocked: false,
    isFollowing: false,
  },
  content: 'this is my ultimate test tweet',
  createdAt: '2025-11-27T17:48:10.124Z',
  replyCount: 0,
  retweetCount: 0,
  likeCount: 0,
  isLiked: false,
  isRetweeted: false,
  entities: {
    mentions: [],
    hashtags: [],
  },
  media: [
    {
      type: 'IMAGE',
      url: 'https://cdn.raven.cmp27.space/tweets/55386f7e-4546-4b84-a72c-ddb27227dcc3.jpg',
      altText: '',
      width: 750,
      height: 1000,
    },
    {
      type: 'IMAGE',
      url: 'https://cdn.raven.cmp27.space/tweets/c2c4dfef-9e5f-4a7a-8381-47906e31113b.jpg',
      altText: '',
      width: 2048,
      height: 1535,
    },
    {
      type: 'IMAGE',
      url: 'https://cdn.raven.cmp27.space/tweets/d605666a-59f7-4668-8371-39c9abd747fb.jpg',
      altText: '',
      width: 750,
      height: 1000,
    },
    {
      type: 'IMAGE',
      url: 'https://cdn.raven.cmp27.space/tweets/db9dd3bc-f28d-414c-b00c-9a599ab108a1.jpg',
      altText: '',
      width: 2048,
      height: 1535,
    },
  ],
  replyToTweetId: null,
};
</script>

<template>
  <UiDialog v-model:open="localOpen" class="h[500]">
    <UiDialogContent class="h-auto max-w-lg" content-height="h-auto max-h-[90vh]">
      <TweetComposer>
        <template #reposted-tweet>
          <div class="border-foreground/15 rounded-lg border-1">
            <TweetDefaultCard :tweet="dummyTweet" :is-preview="true" size-class="rounded-md h-50" />
          </div>
        </template>
      </TweetComposer>
    </UiDialogContent>
  </UiDialog>
</template>
