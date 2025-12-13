import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MediaItemCompact from '~/components/tweet/MediaItemCompact.vue';
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
    props: ['src', 'poster'],
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

describe('MediaItemCompact.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders IMAGE via NuxtImg stub with provided alt', async () => {
    const wrapper = mount(MediaItemCompact, {
      props: { media: makeImage(1) },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/image-1.jpg');
    expect(img.attributes('alt')).toBe('image-1');
  });

  it('falls back to default alt for IMAGE when altText empty', async () => {
    const wrapper = mount(MediaItemCompact, {
      props: { media: { ...makeImage(2), altText: '' } },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders GIF treated as IMAGE with alt fallback', async () => {
    const wrapper = mount(MediaItemCompact, {
      props: { media: { ...makeGif(1), altText: '' } },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/gif-1.gif');
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders VIDEO using VideoPlayer stub with src/poster', async () => {
    const wrapper = mount(MediaItemCompact, {
      props: { media: makeVideo(1) },
      global: globalConfig,
    });
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });

  it('applies aspect ratio style when width/height are valid', async () => {
    const media = makeImage(3);
    const wrapper = mount(MediaItemCompact, { props: { media }, global: globalConfig });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    const style = img.attributes('style') || '';
    expect(style.includes(`aspect-ratio: ${media.width} / ${media.height}`)).toBe(true);
  });
});
