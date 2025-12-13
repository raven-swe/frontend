import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Ref } from 'vue';
import type { MediaItem } from '~~/shared/types/shared';
import type { Tweet } from '~~/shared/types/tweets';
import { uploadMediaService } from '@/services/tweet/uploadMediaService';
import { createTweetService } from '@/services/tweet/createTweetService';
import { showToaster } from '@/utils/showToaster';

export const useTweetComposer = (
  tweetContent: Ref<string>,
  media: Ref<MediaItem[]>,
  replyToTweetId?: Ref<string | null>,
  quoteTweetId?: Ref<string | null>,
) => {
  const { t } = useI18n();

  const { uploadImage, uploadVideo, uploadGif } = uploadMediaService();

  const isPosting = ref(false);
  const uploadProgress = ref(0);
  const uploadStatus = ref<'uploading' | 'posting' | null>(null);

  const MAX_LENGTH = 280;
  const MAX_MEDIA = 4;

  const characterCount = computed(() => tweetContent.value.length);
  const isOverLimit = computed(() => characterCount.value > MAX_LENGTH);

  const loadingMessage = computed(() => {
    if (uploadStatus.value === 'uploading') {
      return t('tweet.composer.loading.uploading', { progress: uploadProgress.value });
    }
    if (uploadStatus.value === 'posting') {
      return t('tweet.composer.loading.posting');
    }
    return '';
  });

  const handlePost = async (): Promise<Tweet | null> => {
    if (!tweetContent.value.trim() && media.value.length === 0) return null;
    if (isOverLimit.value) return null;
    if (isPosting.value) return null;

    isPosting.value = true;
    uploadProgress.value = 0;

    try {
      const mediaIds: string[] = [];

      if (media.value.length > 0) {
        uploadStatus.value = 'uploading';

        for (let i = 0; i < media.value.length; i++) {
          const item = media.value[i];

          if (item?.type === 'image') {
            if (!item.file) continue;
            const mediaId = await uploadImage(item.file, 'tweets');
            mediaIds.push(mediaId);
          } else if (item?.type === 'video') {
            if (!item.file) continue;
            const mediaId = await uploadVideo(item.file, 'tweets');
            mediaIds.push(mediaId);
          } else if (item?.type === 'gif' && item.tenorId) {
            const mediaId = await uploadGif(item.tenorId);
            mediaIds.push(mediaId);
          }

          uploadProgress.value = Math.round(((i + 1) / media.value.length) * 100);
        }
      }

      uploadStatus.value = 'posting';
      const newTweet = await createTweetService({
        content: tweetContent.value.trim(),
        media: mediaIds,
        replyToTweetId: replyToTweetId?.value ?? null,
        quoteToTweetId: quoteTweetId?.value ?? null,
      });

      showToaster('success', t('tweet.composer.post-success'));

      return newTweet;
    } catch {
      showToaster('error', t('tweet.composer.post-error'));
      return null;
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

  const handleAddGif = (payload: { tenorId: string; url: string }) => {
    if (media.value.length >= MAX_MEDIA) return;

    const id = `gif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    media.value.push({
      id,
      url: payload.url,
      type: 'gif',
      tenorId: payload.tenorId,
    });
  };

  const handleRemoveMedia = (id: string) => {
    const index = media.value.findIndex((m) => m.id === id);

    if (index !== -1 && index < media.value.length && media.value[index]) {
      if (media.value[index].file) {
        URL.revokeObjectURL(media.value[index].url);
      }
      media.value.splice(index, 1);
    }
  };

  return {
    // state
    isPosting,
    uploadProgress,
    uploadStatus,
    MAX_LENGTH,
    MAX_MEDIA,
    characterCount,
    isOverLimit,
    loadingMessage,

    // actions
    handlePost,
    handleAddMedia,
    handleAddGif,
    handleRemoveMedia,
  };
};
