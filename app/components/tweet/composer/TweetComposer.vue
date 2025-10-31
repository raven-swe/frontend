<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import TweetEditor from './TweetEditor.vue';
import Toolbar from './Toolbar.vue';
import MediaSlideshow from './MediaSlideshow.vue';
import type { MediaItem } from '~~/shared/types/shared';

const tweetContent = ref('');
const tweetEditorRef = ref<InstanceType<typeof TweetEditor> | null>(null);
const userStore = useUserStore();
const media = ref<MediaItem[]>([]);

interface Props {
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'default',
});

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

const characterCount = computed(() => tweetContent.value.length);
const isOverLimit = computed(() => characterCount.value > MAX_LENGTH);

const handlePost = () => {
  if (tweetContent.value.trim() && !isOverLimit.value) {
    // Extract files from media items
    const files = media.value.map((item) => item.file);

    // eslint-disable-next-line no-console
    console.log({
      content: tweetContent.value,
      media: files,
    });

    // Clean up blob URLs
    media.value.forEach((item) => URL.revokeObjectURL(item.url));
    tweetContent.value = '';
    media.value = [];
    tweetEditorRef.value?.resetHeight();
  }
};

const handleAddMedia = (files: File[]) => {
  files.forEach((file) => {
    if (media.value.length === MAX_MEDIA) return;

    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    media.value.push({
      id,
      file,
      url, // for display
      type: 'image',
    });
  });
};

const handleRemoveMedia = (id: string) => {
  const index = media.value.findIndex((m) => m.id === id);

  if (index !== -1 && index < media.value.length && media.value[index]) {
    // Revoke the blob URL to free memory
    URL.revokeObjectURL(media.value[index].url);
    media.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="bg-background border-border max-w-[598px] rounded-lg border p-4">
    <div class="mb-3 flex gap-3">
      <div class="flex-shrink-0">
        <img
          :src="userStore.user?.avatarUrl"
          :alt="$t('tweet.composer.profile-alt', { name: userStore.user?.username || '' })"
          class="h-12 w-12 rounded-full object-cover"
        />
      </div>
      <TweetEditor
        ref="tweetEditorRef"
        v-model="tweetContent"
        :placeholder="$t('tweet.composer.placeholder.' + props.placeholder)"
        :max-length="MAX_LENGTH"
      />
    </div>

    <MediaSlideshow :media="media" :max-media="MAX_MEDIA" @remove="handleRemoveMedia" />

    <slot name="reposted-tweet" />

    <Toolbar
      :disabled="!tweetContent.trim() && media.length === 0"
      :character-count="characterCount"
      :max-length="MAX_LENGTH"
      :is-over-limit="isOverLimit"
      :has-media="media.length > 0"
      :can-add-media="media.length < MAX_MEDIA"
      :button-text="props.placeholder === 'reply' ? 'Reply' : 'Post'"
      @post="handlePost"
      @add-media="handleAddMedia"
    />
  </div>
</template>
