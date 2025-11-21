import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetToolbar from '~/components/tweet/composer/Toolbar.vue';
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
} from '@/constants/files';
import { showToaster } from '@/utils/showToaster';

vi.mock('@/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

describe('TweetToolbar', () => {
  const mockProps = {
    disabled: false,
    characterCount: 0,
    maxLength: 280,
    isOverLimit: false,
    hasMedia: false,
    canAddMedia: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    const wrapper = await mountSuspended(TweetToolbar);

    expect(wrapper.find('.toolbar').exists()).toBe(true);
  });

  it('emits post event when post button is clicked', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const postButton = wrapper.find('.post-button');
    await postButton.trigger('click');

    expect(wrapper.emitted('post')).toBeTruthy();
    expect(wrapper.emitted('post')).toHaveLength(1);
  });

  it('disables post button when disabled prop is true', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, disabled: true },
    });

    const postButton = wrapper.find('.post-button');
    expect(postButton.attributes('disabled')).toBeDefined();
  });

  it('disables post button when over character limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, isOverLimit: true },
    });

    const postButton = wrapper.find('.post-button');
    expect(postButton.attributes('disabled')).toBeDefined();
  });

  it('shows character counter when close to limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 240 },
    });

    const counterElement = wrapper.find('.text-sm.font-medium');
    expect(counterElement.exists()).toBe(true);
    expect(counterElement.text()).toBe('40');
  });

  it('shows progress circle when character count > 0', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 100 },
    });

    const progressCircle = wrapper.find('svg circle:last-child');
    expect(progressCircle.exists()).toBe(true);
  });

  it('applies correct color when over limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 300, isOverLimit: true },
    });

    const counterElement = wrapper.find('.text-destructive');
    expect(counterElement.exists()).toBe(true);
  });

  it('triggers file input when media button is clicked', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click');

    const mediaButton = wrapper.find('.media-btn');
    await mediaButton.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('disables media button when canAddMedia is false', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, canAddMedia: false },
    });

    const mediaButton = wrapper.find('.media-btn');
    expect(mediaButton.attributes('disabled')).toBeDefined();
  });

  it('emits add-media event when files are selected', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('add-media')).toBeTruthy();
    expect(wrapper.emitted('add-media')?.[0]?.[0]).toEqual([mockFile]);
  });

  it('resets file input after file selection', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect((fileInput.element as HTMLInputElement).value).toBe('');
  });

  it('calculates progress correctly', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 140 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = wrapper.vm as any;
    expect(component.progress).toBe(0.5);
  });

  it('shows separator when counter is visible', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 240 },
    });

    const separator = wrapper.find('.separator');
    expect(separator.exists()).toBe(true);
  });

  it('filters out oversized images and shows warning', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const oversizedImage = new File(['x'.repeat(MAX_IMAGE_SIZE_BYTES + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const validImage = new File(['test'], 'small.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [oversizedImage, validImage],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(showToaster).toHaveBeenCalledWith(
      'warning',
      `Image "large.jpg" size exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB} MB.`,
    );
    expect(wrapper.emitted('add-media')?.[0]?.[0]).toEqual([validImage]);
  });

  it('filters out oversized videos and shows warning', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const oversizedVideo = new File(['x'.repeat(MAX_VIDEO_SIZE_BYTES + 1)], 'large.mp4', {
      type: 'video/mp4',
    });
    const validVideo = new File(['test'], 'small.mp4', { type: 'video/mp4' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [oversizedVideo, validVideo],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(showToaster).toHaveBeenCalledWith(
      'warning',
      `Video "large.mp4" size exceeds the maximum limit of ${MAX_VIDEO_SIZE_MB} MB.`,
    );
    expect(wrapper.emitted('add-media')?.[0]?.[0]).toEqual([validVideo]);
  });

  it('does not emit add-media when all files are invalid', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const oversizedImage = new File(['x'.repeat(MAX_IMAGE_SIZE_BYTES + 1)], 'large.jpg', {
      type: 'image/jpeg',
    });

    Object.defineProperty(fileInput.element, 'files', {
      value: [oversizedImage],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('add-media')).toBeFalsy();
    expect(showToaster).toHaveBeenCalled();
  });

  it('accepts valid image and video files together', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const validImage = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
    const validVideo = new File(['test'], 'video.mp4', { type: 'video/mp4' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [validImage, validVideo],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('add-media')?.[0]?.[0]).toEqual([validImage, validVideo]);
    expect(showToaster).not.toHaveBeenCalled();
  });

  it('shows amber color when progress > 0.9', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 260 }, // 260/280 = 0.928
    });

    const progressCircle = wrapper.find('svg circle:last-child');
    expect(progressCircle.attributes('stroke')).toBe('#f59e0b');
  });

  it('shows blue color when progress <= 0.9', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 100 },
    });

    const progressCircle = wrapper.find('svg circle:last-child');
    expect(progressCircle.attributes('stroke')).toBe('#1d9bf0');
  });

  it('file input accepts correct file types', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.attributes('accept')).toBe(
      'image/png,image/jpg,image/jpeg,video/mp4,video/webm,video/mkv',
    );
    expect(fileInput.attributes('multiple')).toBeDefined();
  });
});
