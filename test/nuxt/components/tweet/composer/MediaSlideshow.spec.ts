import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MediaSlideshow from '~/components/tweet/composer/MediaSlideshow.vue';
import type { MediaItem } from '~~/shared/types/shared';

describe('Media Slide Show', () => {
  const createMockMedia = (count: number): MediaItem[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `media-${i}`,
      file: new File([], `image-${i}.jpg`, { type: 'image/jpeg' }),
      url: `https://example.com/image-${i}.jpg`,
      type: 'image' as const,
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when media array is empty', async () => {
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media: [] },
    });

    expect(wrapper.find('.relative.ms-\\[60px\\]').exists()).toBe(false);
  });

  it('renders single media item with full width', async () => {
    const media = createMockMedia(1);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const mediaItem = wrapper.find('.aspect-\\[25\\/28\\]');
    expect(mediaItem.exists()).toBe(true);
    expect(mediaItem.attributes('style')).toContain('width: 100%');
  });

  it('renders multiple media items with 43% width', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const mediaItems = wrapper.findAll('.aspect-\\[25\\/28\\]');
    expect(mediaItems).toHaveLength(3);
    mediaItems.forEach((item) => {
      expect(item.attributes('style')).toContain('width: 43%');
    });
  });

  it('displays correct image URLs', async () => {
    const media = createMockMedia(2);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const images = wrapper.findAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]?.attributes('src')).toBe('https://example.com/image-0.jpg');
    expect(images[1]?.attributes('src')).toBe('https://example.com/image-1.jpg');
  });

  it('shows remove button for each media item', async () => {
    const media = createMockMedia(2);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const removeButtons = wrapper.findAll('button');
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('emits remove event when remove button is clicked', async () => {
    const media = createMockMedia(2);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const removeButtons = wrapper.findAll('.absolute.start-2.top-2');
    await removeButtons[0]?.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('media-0');
  });

  it('does not show navigation arrows for single media', async () => {
    const media = createMockMedia(1);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const leftArrow = wrapper.find('.absolute.start-2.top-1\\/2');
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');

    expect(leftArrow.exists()).toBe(false);
    expect(rightArrow.exists()).toBe(false);
  });

  it('does not show navigation arrows for two media items', async () => {
    const media = createMockMedia(2);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    expect(rightArrow.exists()).toBe(false);
  });

  it('shows right arrow for three or more media items initially', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const leftArrow = wrapper.findAll('.absolute.start-2.top-1\\/2');
    const rightArrow = wrapper.findAll('.absolute.end-2.top-1\\/2');

    expect(leftArrow.length).toBe(0); // No left arrow at start
    expect(rightArrow.length).toBe(1); // Right arrow visible
  });

  it('navigates right when right arrow is clicked', async () => {
    const media = createMockMedia(4);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const slidingTrack = wrapper.find('.flex.gap-2');
    const _initialTransform = slidingTrack.attributes('style');

    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    const newTransform = slidingTrack.attributes('style');
    expect(newTransform).toContain('translateX(-45%)');
  });

  it('navigates left when left arrow is clicked after navigating right', async () => {
    const media = createMockMedia(4);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    // Navigate right first
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    // Now navigate left
    const leftArrow = wrapper.find('.absolute.start-2.top-1\\/2');
    await leftArrow.trigger('click');
    await wrapper.vm.$nextTick();

    const slidingTrack = wrapper.find('.flex.gap-2');
    expect(slidingTrack.attributes('style')).toContain('translateX(0%)');
  });

  it('does not show left arrow at start position', async () => {
    const media = createMockMedia(4);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const leftArrows = wrapper.findAll('.absolute.start-2.top-1\\/2');
    expect(leftArrows.length).toBe(0);
  });

  it('does not show right arrow at end position', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    // Navigate to end
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    const rightArrows = wrapper.findAll('.absolute.end-2.top-1\\/2');
    expect(rightArrows.length).toBe(0);
  });

  it('adjusts currentIndex when removing media before current position', async () => {
    const media = createMockMedia(4);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    // Navigate to position 2
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    // Remove first media item
    const removeButtons = wrapper.findAll('.absolute.start-2.top-2');
    await removeButtons[0]?.trigger('click');

    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('media-0');
  });

  it('adjusts currentIndex when removing last visible media', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    // Navigate to show last item
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    // Remove the last media item
    const removeButtons = wrapper.findAll('.absolute.start-2.top-2');
    await removeButtons[removeButtons.length - 1]?.trigger('click');

    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('media-2');
  });

  it('resets to index 0 when media count drops to 2 or less', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    // Navigate right
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    // Remove a media item
    const removeButtons = wrapper.findAll('.absolute.start-2.top-2');
    await removeButtons[0]?.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
  });

  it('calculates translateX correctly based on currentIndex', async () => {
    const media = createMockMedia(5);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const slidingTrack = wrapper.find('.flex.gap-2');

    // Initial position
    expect(slidingTrack.attributes('style')).toContain('translateX(0%)');

    // Navigate right once
    const rightArrow = wrapper.find('.absolute.end-2.top-1\\/2');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();

    expect(slidingTrack.attributes('style')).toContain('translateX(-45%)');
  });

  it('applies correct transition classes to sliding track', async () => {
    const media = createMockMedia(3);
    const wrapper = await mountSuspended(MediaSlideshow, {
      props: { media },
    });

    const slidingTrack = wrapper.find('.flex.gap-2');
    expect(slidingTrack.classes()).toContain('transition-transform');
    expect(slidingTrack.classes()).toContain('duration-300');
    expect(slidingTrack.classes()).toContain('ease-out');
  });

  it('renders with default empty media array when prop not provided', async () => {
    const wrapper = await mountSuspended(MediaSlideshow);

    expect(wrapper.find('.relative.ms-\\[60px\\]').exists()).toBe(false);
  });
});
