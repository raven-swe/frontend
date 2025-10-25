import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetMedia from '@/components/tweet/TweetMedia.vue';
import type { TweetMedia as TMedia } from '~~/shared/types/tweets';

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

describe('TweetMedia.vue', () => {
  it('has base wrapper classes', async () => {
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media: [] },
      global: { stubs: { NuxtImg: true } },
    });
    const classes = wrapper.classes();
    expect(classes).toContain('flex');
    expect(classes).toContain('w-full');
    expect(classes).toContain('items-center');
  });

  it('always renders the static NuxtImg cover', async () => {
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media: undefined },
      global: { stubs: { NuxtImg: true } },
    });
    // When stubbed, NuxtImg renders as <nuxtimg-stub ...>
    const img = wrapper.find('[src="/oklahoma-city-thunder-black-and-gold-niwgymcycoo5z0v3.jpg"]');
    expect(img.exists()).toBe(true);
  });

  it('renders GIFs from media with proper attributes', async () => {
    const media: TMedia[] = [makeGif(1), makeGif(2)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const gifs = wrapper.findAll('img');
    // 2 GIF <img>, the static cover is NuxtImg (stubbed), not counted here
    expect(gifs).toHaveLength(2);
    expect(gifs[0].attributes('src')).toBe('/gif-1.gif');
    expect(gifs[0].attributes('alt')).toBe('gif-1');
  });

  it('renders VIDEOS from media with controls and src', async () => {
    const media: TMedia[] = [makeVideo(1)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const videos = wrapper.findAll('video');
    expect(videos).toHaveLength(1);
    expect(videos[0].attributes('src')).toBe('/video-1.mp4');
    // controls is a boolean attribute; Vue Test Utils exposes presence via "controls" key
    expect('controls' in videos[0].attributes()).toBe(true);
  });

  it('falls back to default alt text for GIF when altText is empty', async () => {
    const media: TMedia[] = [{ ...makeGif(1), altText: '' }];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const gifs = wrapper.findAll('img');
    expect(gifs).toHaveLength(1);
    expect(gifs[0].attributes('alt')).toBe('Tweet media');
  });

  it('falls back to default alt text for VIDEO when altText is empty and keeps sizing classes', async () => {
    const media: TMedia[] = [{ ...makeVideo(1), altText: '' }];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    const videos = wrapper.findAll('video');
    expect(videos).toHaveLength(1);
    expect(videos[0].attributes('alt')).toBe('Tweet media');
    // also assert classes from template (coverage for lines 29-40 region)
    expect(videos[0].classes()).toContain('mx-auto');
    expect(videos[0].classes()).toContain('w-80');
  });

  it('ignores IMAGE media in loops (only static cover present)', async () => {
    const media: TMedia[] = [makeImage(1), makeImage(2)];
    const wrapper = await mountSuspended(TweetMedia, {
      props: { media },
      global: { stubs: { NuxtImg: true } },
    });
    // Only GIF <img> tags are rendered; IMAGE types are not looped in template
    const gifs = wrapper.findAll('img');
    expect(gifs).toHaveLength(0);

    // NuxtImg cover should still be there
    const cover = wrapper.find(
      '[src="/oklahoma-city-thunder-black-and-gold-niwgymcycoo5z0v3.jpg"]',
    );
    expect(cover.exists()).toBe(true);
  });
});
