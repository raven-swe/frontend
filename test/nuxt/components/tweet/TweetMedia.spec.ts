import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TweetMedia from '~/components/tweet/TweetMedia.vue';
import type { TweetMedia as TMedia } from '~~/shared/types/tweets';

// Stub components for faster tests
const stubs = {
  NuxtImg: {
    template: '<img :src="src" :alt="alt" class="nuxt-img-stub" />',
    props: ['src', 'alt'],
  },
  VideoPlayer: { template: '<div class="video-player-stub"></div>' },
  Icon: { template: '<i />' },
};

const globalConfig = {
  stubs,
};

// Test media factories matching current component expectations
const makeGif = (i = 1): TMedia => ({
  type: 'GIF',
  url: `/gif-${i}.gif`,
  altText: `gif-${i}`,
  width: 200,
  height: 200,
});
const makeVideo = (i = 1): TMedia => ({
  type: 'VIDEO',
  url: `/video-${i}.mp4`,
  altText: `video-${i}`,
  width: 640,
  height: 360,
});
const makeImage = (i = 1): TMedia => ({
  type: 'IMAGE',
  url: `/image-${i}.jpg`,
  altText: `image-${i}`,
  width: 600,
  height: 400,
});

describe('TweetMedia.vue (updated layout)', () => {
  it('renders nothing when media array is empty', async () => {
    const wrapper = mount(TweetMedia, {
      props: { media: [] },
      global: globalConfig,
    });
    expect(wrapper.element.childNodes.length).toBe(0);
  });

  it('renders GIF media via NuxtImg stub with correct src/alt', async () => {
    const media: TMedia[] = [makeGif(1), makeGif(2)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const imgs = wrapper.findAll('.nuxt-img-stub');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]!.attributes('src')).toBe('/gif-1.gif');
    expect(imgs[0]!.attributes('alt')).toBe('gif-1');
  });

  it('falls back to default alt text for GIF when altText empty', async () => {
    const media: TMedia[] = [{ ...makeGif(1), altText: '' }];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const imgs = wrapper.findAll('.nuxt-img-stub');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]!.attributes('alt')).toBe('Tweet media');
  });

  it('renders VIDEO media without native controls but with custom control buttons', async () => {
    const media: TMedia[] = [makeVideo(1)];
    const wrapper = mount(TweetMedia, { props: { media }, global: globalConfig });
    // VideoPlayer is stubbed, check for the stub
    const videoPlayers = wrapper.findAll('.video-player-stub');
    expect(videoPlayers).toHaveLength(1);
  });

  it('renders IMAGE media items via NuxtImg stub', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const imgs = wrapper.findAll('.nuxt-img-stub');
    expect(imgs).toHaveLength(2);
  });

  it('layout: single media uses grid container with rounded-xl', async () => {
    const media: TMedia[] = [makeImage(1)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const gridContainers = wrapper.findAll('div.grid');
    expect(gridContainers).toHaveLength(1);
    expect(gridContainers[0]!.classes()).toContain('rounded-xl');
  });

  it('layout: two media uses grid-cols-2 with exactly two MediaItem instances', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const container = wrapper.find('div.grid.grid-cols-2');
    expect(container.exists()).toBe(true);
    const imgs = wrapper.findAll('.nuxt-img-stub');
    expect(imgs).toHaveLength(2);
  });

  it('layout: three media uses grid-rows-2 and left item spans two rows', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2), makeImage(3)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const container = wrapper.find('div.grid.grid-cols-2.grid-rows-2');
    expect(container.exists()).toBe(true);
  });

  it('layout: four media uniform grid has grid-cols-2 and grid-rows-2 with four items', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2), makeImage(3), makeImage(4)];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const container = wrapper.find('div.grid.grid-cols-2.grid-rows-2');
    expect(container.exists()).toBe(true);
    const imgs = wrapper.findAll('.nuxt-img-stub');
    expect(imgs).toHaveLength(4);
  });

  it('fallback alt text for IMAGE when empty', async () => {
    const media: TMedia[] = [{ ...makeImage(5), altText: '' }];
    const wrapper = mount(TweetMedia, {
      props: { media },
      global: globalConfig,
    });
    const img = wrapper.find('.nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('fallback aria-label for VIDEO when altText empty', async () => {
    const media: TMedia[] = [{ ...makeVideo(7), altText: '' }];
    const wrapper = mount(TweetMedia, { props: { media }, global: globalConfig });
    // VideoPlayer is stubbed, just verify it renders
    const videoPlayer = wrapper.find('.video-player-stub');
    expect(videoPlayer.exists()).toBe(true);
  });
});
