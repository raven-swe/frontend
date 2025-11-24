import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MediaItem from '~/components/tweet/MediaItem.vue';
import type { TweetMedia } from '~~/shared/types/tweets';
import type { VueWrapper, DOMWrapper } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';

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

// Utility to get the custom controls container for VIDEO
function findControls(
  wrapper: VueWrapper<ComponentPublicInstance>,
): DOMWrapper<HTMLDivElement> | undefined {
  return wrapper.findAll('div').find((d) => {
    const cls = d.attributes('class') || '';
    return cls.includes('bg-black/50');
  }) as DOMWrapper<HTMLDivElement> | undefined;
}

describe('MediaItem.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders IMAGE via NuxtImg stub with provided alt', async () => {
    const wrapper = await mountSuspended(MediaItem, {
      props: { media: makeImage(1) },
      global: { stubs: { NuxtImg: true } },
    });
    const img = wrapper.find('nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/image-1.jpg');
    expect(img.attributes('alt')).toBe('image-1');
  });

  it('falls back to default alt for IMAGE when altText empty', async () => {
    const wrapper = await mountSuspended(MediaItem, {
      props: { media: { ...makeImage(2), altText: '' } },
      global: { stubs: { NuxtImg: true } },
    });
    const img = wrapper.find('nuxt-img-stub');
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders GIF treated as IMAGE with alt fallback', async () => {
    const wrapper = await mountSuspended(MediaItem, {
      props: { media: { ...makeGif(1), altText: '' } },
      global: { stubs: { NuxtImg: true } },
    });
    const img = wrapper.find('nuxt-img-stub');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/gif-1.gif');
    expect(img.attributes('alt')).toBe('Tweet media');
  });

  it('renders VIDEO with aria-label fallback and custom controls', async () => {
    const wrapper = await mountSuspended(MediaItem, {
      props: { media: { ...makeVideo(1), altText: '' } },
    });
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('src')).toBe('/video-1.mp4');
    expect(video.attributes('aria-label')).toBe('Tweet video');
    const controls = findControls(wrapper)!;
    expect(controls.exists()).toBe(true);
    // Should not have native controls attribute
    expect(video.attributes('controls')).toBeUndefined();
    // Buttons (play + fullscreen at least)
    const buttons = controls.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('play/pause events toggle controls visibility classes', async () => {
    const wrapper = await mountSuspended(MediaItem, { props: { media: makeVideo(3) } });
    const videoEl = wrapper.find('video');
    // Mock play/pause since jsdom does not implement them
    let pausedState = true;
    (videoEl.element as HTMLVideoElement).play = vi.fn().mockImplementation(() => {
      pausedState = false;
      videoEl.element.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
    (videoEl.element as HTMLVideoElement).pause = vi.fn().mockImplementation(() => {
      pausedState = true;
      videoEl.element.dispatchEvent(new Event('pause'));
    });
    Object.defineProperty(videoEl.element, 'paused', {
      get: () => pausedState,
      configurable: true,
    });

    // Initial (paused) controls visible
    let controls = findControls(wrapper)!;
    expect(controls.classes()).toContain('opacity-100');

    // Trigger play via method (click handler calls togglePlay)
    await videoEl.trigger('click');
    controls = findControls(wrapper)!;
    expect(controls.classes()).toContain('opacity-0'); // hidden while playing (until hover)

    // Trigger pause
    await videoEl.trigger('click');
    controls = findControls(wrapper)!;
    expect(controls.classes()).toContain('opacity-100');
  });

  it('updates time & progress on timeupdate and supports seeking', async () => {
    const wrapper = await mountSuspended(MediaItem, { props: { media: makeVideo(4) } });
    const videoEl = wrapper.find('video').element as HTMLVideoElement;
    // Mock duration and currentTime
    Object.defineProperty(videoEl, 'duration', { value: 120, configurable: true });
    Object.defineProperty(videoEl, 'currentTime', {
      value: 30,
      writable: true,
      configurable: true,
    });

    // Dispatch events to populate state
    videoEl.dispatchEvent(new Event('loadedmetadata'));
    videoEl.dispatchEvent(new Event('timeupdate'));
    await nextTick();

    // Time display should reflect formatted times (30s -> 0:30, duration 120 -> 2:00)
    const controls = findControls(wrapper)!;
    const timeDisplay = controls.find('span');
    expect(timeDisplay.text()).toBe('0:30 / 2:00');

    // Seek: click middle of slider
    const slider = controls.find('[role="slider"]');
    expect(slider.exists()).toBe(true);
    // Stub getBoundingClientRect for deterministic width
    slider.element.getBoundingClientRect = () =>
      ({ left: 0, width: 200, top: 0, bottom: 0, right: 200, height: 10 }) as DOMRect;
    // Update mock currentTime setter behavior
    let internalCurrent = 30;
    Object.defineProperty(videoEl, 'currentTime', {
      get: () => internalCurrent,
      set: (v) => {
        internalCurrent = v;
      },
      configurable: true,
    });
    // Click at 100px (50%)
    await slider.trigger('click', { clientX: 100 });
    // After seek, internalCurrent should be ~60 (50% of 120)
    expect(internalCurrent).toBeCloseTo(60, 0);
    const ariaNow = slider.attributes('aria-valuenow');
    expect(Number(ariaNow)).toBeGreaterThanOrEqual(49);
    expect(Number(ariaNow)).toBeLessThanOrEqual(51);
  });

  it('toggles fullscreen state and adjusts controls positioning class', async () => {
    const wrapper = await mountSuspended(MediaItem, { props: { media: makeVideo(5) } });
    const videoContainer = wrapper.find('div.group');
    const controls = findControls(wrapper)!;
    const buttons = controls.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const fullscreenBtn = buttons[buttons.length - 1]!; // non-null
    const containerEl = videoContainer.element as HTMLElement;
    const doc = document as unknown as {
      fullscreenElement: Element | null;
      exitFullscreen?: () => Promise<void>;
    };
    const requestFullscreenSpy = vi.fn((): Promise<void> => {
      doc.fullscreenElement = containerEl;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });
    // Assign spy respecting existing signature
    Object.assign(containerEl, { requestFullscreen: requestFullscreenSpy });
    await fullscreenBtn.trigger('click');
    expect(requestFullscreenSpy).toHaveBeenCalledTimes(1);
    expect(findControls(wrapper)!.classes()).toContain('fixed');
    const exitFullscreenSpy = vi.fn((): Promise<void> => {
      doc.fullscreenElement = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });
    doc.exitFullscreen = exitFullscreenSpy;
    await fullscreenBtn.trigger('click');
    expect(exitFullscreenSpy).toHaveBeenCalledTimes(1);
    expect(findControls(wrapper)!.classes()).not.toContain('fixed');
  });

  it('resets progress/time when media URL changes', async () => {
    const wrapper = await mountSuspended(MediaItem, { props: { media: makeVideo(6) } });
    const videoEl = wrapper.find('video').element as HTMLVideoElement;
    Object.defineProperty(videoEl, 'duration', { value: 100, configurable: true });
    let internalCurrent = 40;
    Object.defineProperty(videoEl, 'currentTime', {
      get: () => internalCurrent,
      set: (v) => {
        internalCurrent = v;
      },
      configurable: true,
    });
    videoEl.dispatchEvent(new Event('loadedmetadata'));
    videoEl.dispatchEvent(new Event('timeupdate'));
    await nextTick();
    // Confirm time display pre-change
    let controls = findControls(wrapper)!;
    expect(controls.find('span').text()).toBe('0:40 / 1:40');

    // Change URL
    await wrapper.setProps({ media: { ...makeVideo(6), url: '/video-6b.mp4' } });
    // After prop change the component resets times (watcher) -> should show 0:00 / 0:00 until metadata loads again
    controls = findControls(wrapper)!;
    expect(controls.find('span').text()).toBe('0:00 / 0:00');
  });
});
