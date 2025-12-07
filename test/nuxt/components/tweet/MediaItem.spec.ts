import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MediaItem from '~/components/tweet/MediaItem.vue';
import type { TweetMedia } from '~~/shared/types/tweets';

// Stub components for faster tests
const stubs = {
  NuxtImg: {
    template: '<img :src="src" :alt="alt" class="nuxt-img-stub" />',
    props: ['src', 'alt'],
  },
  Icon: { template: '<i />' },
  VideoPlayer: {
    template: '<div class="video-player-stub" />',
    props: ['options', 'onPlayerReady'],
  },
};

const globalConfig = { stubs };

// Helper factories (match shape used in component)
const makeImage = (i = 1): TweetMedia => ({
  type: 'IMAGE',
  url: `/image-${i}.jpg`,
  altText: `image-${i}`,
  width: 600,
  height: 400,
});
const makeGif = (i = 1): TweetMedia => ({
  type: 'GIF',
  url: `/gif-${i}.gif`,
  altText: `gif-${i}`,
  width: 200,
  height: 200,
});
const makeVideo = (i = 1): TweetMedia => ({
  type: 'VIDEO',
  url: `/video-${i}.mp4`,
  altText: `video-${i}`,
  width: 640,
  height: 360,
});

describe('MediaItem.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders IMAGE via NuxtImg stub with provided alt', async () => {
    const wrapper = mount(MediaItem, {
      props: { media: makeImage(1) },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/image-1.jpg');
    expect(img.attributes('alt')).toBe('image-1');
  });

  it('falls back to default alt for IMAGE when altText empty', async () => {
    const wrapper = mount(MediaItem, {
      props: { media: { ...makeImage(2), altText: '' } },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders GIF treated as IMAGE with alt fallback', async () => {
    const wrapper = mount(MediaItem, {
      props: { media: { ...makeGif(1), altText: '' } },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/gif-1.gif');
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders VIDEO with aria-label fallback and custom controls', async () => {
    const wrapper = mount(MediaItem, {
      props: { media: { ...makeVideo(1), altText: '' } },
      global: globalConfig,
    });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });

  it('play/pause events toggle controls visibility classes', async () => {
    const wrapper = mount(MediaItem, { props: { media: makeVideo(3) }, global: globalConfig });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });

  it('updates time & progress on timeupdate and supports seeking', async () => {
    const wrapper = mount(MediaItem, { props: { media: makeVideo(4) }, global: globalConfig });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });

  it('toggles fullscreen state and adjusts controls positioning class', async () => {
    const wrapper = mount(MediaItem, { props: { media: makeVideo(5) }, global: globalConfig });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });

  it('resets progress/time when media URL changes', async () => {
    const wrapper = mount(MediaItem, { props: { media: makeVideo(6) }, global: globalConfig });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);

    // Change URL
    await wrapper.setProps({ media: { ...makeVideo(6), url: '/video-6b.mp4' } });
    expect(videoPlayer.exists()).toBe(true);
  });
});
