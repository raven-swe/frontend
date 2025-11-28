import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import { useTweetComposer } from '~/composables/useTweetComposer';
import { uploadMediaService } from '@/services/tweet/uploadMediaService';
import { createTweetService } from '@/services/tweet/createTweetService';
import { showToaster } from '@/utils/showToaster';
import type { MediaItem } from '~~/shared/types/shared';

// Mock dependencies
vi.mock('@/services/tweet/uploadMediaService');
vi.mock('@/services/tweet/createTweetService');
vi.mock('@/utils/showToaster');
vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual('vue-i18n');
  return {
    ...actual,
    useI18n: () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t: (key: string, params?: Record<string, any>) => {
        const i18n = createI18n({
          locale: 'en',
          messages: { en: messages },
        });
        return i18n.global.t(key, params);
      },
    }),
  };
});

describe('useTweetComposer', () => {
  let tweetContent: ReturnType<typeof ref<string>>;
  let media: ReturnType<typeof ref<MediaItem[]>>;
  let replyToTweetId: ReturnType<typeof ref<string | null>>;

  const mockUploadImage = vi.fn();
  const mockUploadVideo = vi.fn();
  const mockCreateTweetService = vi.fn();
  const mockShowToaster = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    tweetContent = ref('');
    media = ref([]);
    replyToTweetId = ref(null);

    (uploadMediaService as ReturnType<typeof vi.fn>).mockReturnValue({
      uploadImage: mockUploadImage,
      uploadVideo: mockUploadVideo,
    });

    (createTweetService as ReturnType<typeof vi.fn>).mockImplementation(mockCreateTweetService);
    (showToaster as ReturnType<typeof vi.fn>).mockImplementation(mockShowToaster);

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handlePost', () => {
    it('returns null when content is empty and no media', async () => {
      const composer = useTweetComposer(tweetContent, media);

      const result = await composer.handlePost();

      expect(result).toBeNull();
      expect(mockCreateTweetService).not.toHaveBeenCalled();
    });

    it('returns null when over character limit', async () => {
      const composer = useTweetComposer(tweetContent, media);
      tweetContent.value = 'a'.repeat(281);

      const result = await composer.handlePost();

      expect(result).toBeNull();
      expect(mockCreateTweetService).not.toHaveBeenCalled();
    });

    it('posts tweet with text content only', async () => {
      const composer = useTweetComposer(tweetContent, media);
      tweetContent.value = 'Test tweet';

      const mockTweet = { id: '1', content: 'Test tweet' };
      mockCreateTweetService.mockResolvedValue(mockTweet);

      const result = await composer.handlePost();

      expect(mockCreateTweetService).toHaveBeenCalledWith({
        content: 'Test tweet',
        media: [],
        replyToTweetId: null,
      });
      expect(result).toEqual(mockTweet);
      expect(mockShowToaster).toHaveBeenCalledWith('success', expect.any(String));
    });

    it('uploads images and posts tweet', async () => {
      const composer = useTweetComposer(tweetContent, media);
      tweetContent.value = 'Tweet with image';
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      composer.handleAddMedia([mockFile]);

      mockUploadImage.mockResolvedValue('media-id-1');
      const mockTweet = { id: '1', content: 'Tweet with image', media: ['media-id-1'] };
      mockCreateTweetService.mockResolvedValue(mockTweet);

      const result = await composer.handlePost();

      expect(mockUploadImage).toHaveBeenCalledWith(mockFile, 'tweets');
      expect(mockCreateTweetService).toHaveBeenCalledWith({
        content: 'Tweet with image',
        media: ['media-id-1'],
        replyToTweetId: null,
      });
      expect(result).toEqual(mockTweet);
    });

    it('uploads videos and posts tweet', async () => {
      const composer = useTweetComposer(tweetContent, media);
      tweetContent.value = 'Tweet with video';
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      composer.handleAddMedia([mockFile]);

      mockUploadVideo.mockResolvedValue('media-id-1');
      const mockTweet = { id: '1', content: 'Tweet with video', media: ['media-id-1'] };
      mockCreateTweetService.mockResolvedValue(mockTweet);

      const result = await composer.handlePost();

      expect(mockUploadVideo).toHaveBeenCalledWith(mockFile, 'tweets');
      expect(result).toEqual(mockTweet);
    });

    it('includes replyToTweetId when provided', async () => {
      replyToTweetId.value = 'parent-tweet-id';
      const composer = useTweetComposer(tweetContent, media, replyToTweetId);
      tweetContent.value = 'Reply tweet';

      const mockTweet = { id: '2', content: 'Reply tweet', replyTo: 'parent-tweet-id' };
      mockCreateTweetService.mockResolvedValue(mockTweet);

      const result = await composer.handlePost();

      expect(mockCreateTweetService).toHaveBeenCalledWith({
        content: 'Reply tweet',
        media: [],
        replyToTweetId: 'parent-tweet-id',
      });
      expect(result).toEqual(mockTweet);
    });

    it('handles upload error gracefully', async () => {
      const composer = useTweetComposer(tweetContent, media);
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      composer.handleAddMedia([mockFile]);

      mockUploadImage.mockRejectedValue(new Error('Upload failed'));

      const result = await composer.handlePost();

      expect(result).toBeNull();
      expect(mockShowToaster).toHaveBeenCalledWith('error', expect.any(String));
      expect(composer.isPosting.value).toBe(false);
    });

    it('handles post error gracefully', async () => {
      const composer = useTweetComposer(tweetContent, media);
      tweetContent.value = 'Test tweet';

      mockCreateTweetService.mockRejectedValue(new Error('Post failed'));

      const result = await composer.handlePost();

      expect(result).toBeNull();
      expect(mockShowToaster).toHaveBeenCalledWith('error', expect.any(String));
      expect(composer.isPosting.value).toBe(false);
    });
  });
});
