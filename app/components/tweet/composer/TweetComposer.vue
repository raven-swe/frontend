<script setup lang="ts">
import { ref, defineEmits, toRef } from 'vue';
import { useUserStore } from '@/stores/user';
import TweetEditor from './TweetEditor.vue';
import Toolbar from './Toolbar.vue';
import MediaSlideshow from './MediaSlideshow.vue';
import type { MediaItem } from '~~/shared/types/shared';
import type { Tweet } from '~~/shared/types/tweets';
import Avatar from '~/components/ui/Avatar.vue';
import { usePostTweet } from '@/composables/usePostTweet';

interface Props {
  replyToTweetId?: string | null;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  replyToTweetId: null,
});

const tweetContent = ref('');
const tweetEditorRef = ref<InstanceType<typeof TweetEditor> | null>(null);
const userStore = useUserStore();
const media = ref<MediaItem[]>([]);

const replyToRef = toRef(props, 'replyToTweetId');
const {
  isPosting,
  MAX_LENGTH,
  MAX_MEDIA,
  characterCount,
  isOverLimit,
  loadingMessage,
  handlePost,
  handleAddMedia,
  handleRemoveMedia,
} = usePostTweet(tweetContent, media, replyToRef);

const emit = defineEmits<{
  (e: 'posted', tweet: Tweet): void;
}>();

const handlePostWrapper = async () => {
  const newTweet = await handlePost();
  if (!newTweet) return;

  emit('posted', newTweet);

  // Cleanup
  media.value.forEach((item) => URL.revokeObjectURL(item.url));
  tweetContent.value = '';
  media.value = [];
  tweetEditorRef.value?.resetHeight();
};
</script>

<template>
  <div class="bg-background relative max-w-[598px] p-4 pb-15">
    <div class="mb-3 flex gap-3">
      <div class="flex-shrink-0">
        <Avatar
          :img="userStore.user?.avatarUrl"
          :alt="$t('tweet.composer.profile-alt', { name: userStore.user?.username || '' })"
          :size="'sm'"
          variant="primary"
        />
      </div>
      <TweetEditor
        ref="tweetEditorRef"
        v-model="tweetContent"
        :placeholder="$t('tweet.composer.placeholder.' + props.type)"
        :max-length="MAX_LENGTH"
        @paste-media="handleAddMedia"
      />
    </div>

    <MediaSlideshow
      :media="media"
      :max-media="MAX_MEDIA"
      :composer-type="type"
      @remove="handleRemoveMedia"
    />

    <slot name="reposted-tweet" />

    <div class="bg-background absolute start-0 end-0 bottom-0 p-2">
      <div v-if="isPosting" class="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
        <UiSpinner class="h-4 w-4" />
        <span>{{ loadingMessage }}</span>
      </div>

      <Toolbar
        :disabled="!tweetContent.trim() && media.length === 0"
        :character-count="characterCount"
        :max-length="MAX_LENGTH"
        :is-over-limit="isOverLimit"
        :has-media="media.length > 0"
        :can-add-media="media.length < MAX_MEDIA"
        :button-text="$t('tweet.composer.button.' + props.type)"
        :is-posting="isPosting"
        :composer-type="type"
        @post="handlePostWrapper"
        @add-media="handleAddMedia"
      />
    </div>
  </div>
</template>
