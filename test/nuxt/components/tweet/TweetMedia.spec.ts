import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetMedia from '~/components/tweet/TweetMedia.vue';
import type { TweetMedia as TMedia } from '~~/shared/types/tweets';

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
  it('renders wrapper with expected base classes', async () => {
    const wrapper = await mountSuspended(TweetMedia, { props: { media: [] } });
    const classes = wrapper.classes();
    expect(classes).toContain('w-full');
    expect(classes).toContain('pt-2');
  });

  it('renders no media items for empty array', async () => {
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media: [] },
      global: { stubs: { NuxtImg: true } },
    });
    expect(wrapper.findAll('video')).toHaveLength(0);
    expect(wrapper.findAll('nuxt-img-stub')).toHaveLength(0);
  });

  it('renders GIF media via NuxtImg stub with correct src/alt', async () => {
    const media: TMedia[] = [makeGif(1), makeGif(2)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const imgs = wrapper.findAll('nuxt-img-stub');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]!.attributes('src')).toBe('/gif-1.gif');
    expect(imgs[0]!.attributes('alt')).toBe('gif-1');
  });

  it('falls back to default alt text for GIF when altText empty', async () => {
    const media: TMedia[] = [{ ...makeGif(1), altText: '' }];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const imgs = wrapper.findAll('nuxt-img-stub');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]!.attributes('alt')).toBe('Tweet media');
  });

  it('renders VIDEO media without native controls but with custom control buttons', async () => {
    const media: TMedia[] = [makeVideo(1)];
    const wrapper = await mountSuspended(TweetMedia, { props: { media } });
    const videos = wrapper.findAll('video');
    expect(videos).toHaveLength(1);
    expect(videos[0]!.attributes('src')).toBe('/video-1.mp4');
    expect(videos[0]!.attributes('controls')).toBeUndefined();
    // Buttons from custom controls (play, fullscreen, etc.)
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders IMAGE media items via NuxtImg stub', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const imgs = wrapper.findAll('nuxt-img-stub');
    expect(imgs).toHaveLength(2);
  });

  it('layout: single media uses grid container with rounded-xl', async () => {
    const media: TMedia[] = [makeImage(1)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const gridContainers = wrapper.findAll('div.grid');
    expect(gridContainers).toHaveLength(1);
    expect(gridContainers[0]!.classes()).toContain('rounded-xl');
  });

  it('layout: two media uses grid-cols-2 with exactly two MediaItem instances', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const container = wrapper.find('div.grid.grid-cols-2');
    expect(container.exists()).toBe(true);
    const imgs = wrapper.findAll('nuxt-img-stub');
    expect(imgs).toHaveLength(2);
  });

  it('layout: three media uses grid-rows-2 and left item spans two rows', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2), makeImage(3)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const container = wrapper.find('div.grid.grid-cols-2.grid-rows-2');
    expect(container.exists()).toBe(true);
    const spanning = container.find('div.col-span-1.row-span-2');
    expect(spanning.exists()).toBe(true);
  });

  it('layout: four media uniform grid has grid-cols-2 and grid-rows-2 with four items', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2), makeImage(3), makeImage(4)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const container = wrapper.find('div.grid.grid-cols-2.grid-rows-2');
    expect(container.exists()).toBe(true);
    const imgs = wrapper.findAll('nuxt-img-stub');
    expect(imgs).toHaveLength(4);
  });

  it('fallback alt text for IMAGE when empty', async () => {
    const media: TMedia[] = [{ ...makeImage(5), altText: '' }];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const img = wrapper.find('nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('fallback aria-label for VIDEO when altText empty', async () => {
    const media: TMedia[] = [{ ...makeVideo(7), altText: '' }];
    const wrapper = await mountSuspended(TweetMedia, { props: { media } });
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    // MediaItem uses altText || 'Tweet video' for aria-label fallback
    expect(video.attributes('aria-label')).toBe('Tweet video');
  });
});
