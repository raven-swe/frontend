<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import TweetEditor from './TweetEditor.vue';
import Toolbar from './Toolbar.vue';
import MediaSlideshow from './MediaSlideshow.vue';
import type { MediaItem } from '~~/shared/types/shared';
import { uploadMediaService } from '@/services/tweet/uploadMediaService';
import { createTweetService } from '@/services/tweet/createTweetService';
import { showToaster } from '@/utils/showToaster';

const tweetContent = ref('');
const tweetEditorRef = ref<InstanceType<typeof TweetEditor> | null>(null);
const userStore = useUserStore();
const media = ref<MediaItem[]>([]);

// Loading states
const isPosting = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref<'uploading' | 'posting' | null>(null);

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

const characterCount = computed(() => tweetContent.value.length);
const isOverLimit = computed(() => characterCount.value > MAX_LENGTH);

const loadingMessage = computed(() => {
  if (uploadStatus.value === 'uploading') {
    return $t('tweet.composer.loading.uploading', { progress: uploadProgress.value });
  }
  if (uploadStatus.value === 'posting') {
    return $t('tweet.composer.loading.posting');
  }
  return '';
});

const { uploadImage, uploadVideo } = uploadMediaService();

const handlePost = async () => {
  if (!tweetContent.value.trim() && media.value.length === 0) return;
  if (isOverLimit.value) return;
  if (isPosting.value) return; // Prevent double submission

  isPosting.value = true;
  uploadProgress.value = 0;

  try {
    // Upload media files → get media IDs
    const mediaIds: string[] = [];

    if (media.value.length > 0) {
      uploadStatus.value = 'uploading';

      for (let i = 0; i < media.value.length; i++) {
        const item = media.value[i];

        if (item?.type === 'image') {
          const id = await uploadImage(item.file, 'tweets');
          mediaIds.push(id);
        } else if (item?.type === 'video') {
          const id = await uploadVideo(item?.file, 'tweets');
          mediaIds.push(id);
        }

        // Update progress
        uploadProgress.value = Math.round(((i + 1) / media.value.length) * 100);
      }
    }

    // Send create tweet request
    uploadStatus.value = 'posting';
    const newTweet = await createTweetService({
      content: tweetContent.value,
      media: mediaIds,
      isReplyToTweetId: null,
    });

    // eslint-disable-next-line no-console
    console.log('Tweet created:', newTweet);

    showToaster('success', 'Tweet posted successfully!');

    // Cleanup
    media.value.forEach((item) => URL.revokeObjectURL(item.url));
    tweetContent.value = '';
    media.value = [];
    tweetEditorRef.value?.resetHeight();
  } catch {
    showToaster('error', 'Error creating tweet. Please try again.');
  } finally {
    isPosting.value = false;
    uploadStatus.value = null;
    uploadProgress.value = 0;
  }
};

const handleAddMedia = (files: File[]) => {
  files.forEach((file) => {
    if (media.value.length === MAX_MEDIA) return;

    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const type = file.type.startsWith('video') ? 'video' : 'image';

    media.value.push({ id, file, url, type });
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
        :placeholder="$t('tweet.composer.placeholder')"
        :max-length="MAX_LENGTH"
        @paste-media="handleAddMedia"
      />
    </div>

    <MediaSlideshow :media="media" :max-media="MAX_MEDIA" @remove="handleRemoveMedia" />

    <slot name="reposted-tweet" />

    <!-- Loading Indicator -->
    <div v-if="isPosting" class="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
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
      :is-posting="isPosting"
      @post="handlePost"
      @add-media="handleAddMedia"
    />
  </div>
</template>
