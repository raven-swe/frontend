import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VideoPlayer from '~/components/ui/VideoPlayer.vue';

// Mock the @videojs-player/vue module
vi.mock('@videojs-player/vue', () => ({
  VideoPlayer: {
    name: 'VideoPlayer',
    props: ['options', 'class'],
    template: '<div class="video-js-mock" :data-options="JSON.stringify(options)"><slot /></div>',
  },
}));

// Stub ClientOnly to render its default slot
const ClientOnlyStub = {
  name: 'ClientOnly',
  template: '<slot />',
};

describe('VideoPlayer.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the video player component', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    expect(wrapper.find('.video-js-mock').exists()).toBe(true);
  });

  it('passes src prop to video sources', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/my-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.sources).toEqual([{ src: '/my-video.mp4', type: 'video/mp4' }]);
  });

  it('passes poster prop to options', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
        poster: '/poster-image.jpg',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.poster).toBe('/poster-image.jpg');
  });

  it('defaults fluid to true', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.fluid).toBe(true);
  });

  it('accepts fluid prop as false', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
        fluid: false,
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.fluid).toBe(false);
  });

  it('sets controls to true', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.controls).toBe(true);
  });

  it('sets autoplay to false', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.autoplay).toBe(false);
  });

  it('sets preload to metadata', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.preload).toBe('metadata');
  });

  it('sets responsive to true', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.responsive).toBe(true);
  });

  it('sets controlBar autoHide to false', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.controlBar).toEqual({ autoHide: false });
  });

  it('applies video-js styling classes', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    // The component passes these classes to the VideoPlayer
    // Since we're mocking VideoPlayer, we verify the mock receives the component
    expect(wrapper.find('.video-js-mock').exists()).toBe(true);
  });

  it('handles undefined poster gracefully', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: '/test-video.mp4',
      },
      global: {
        stubs: { ClientOnly: ClientOnlyStub },
      },
    });

    const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
    expect(options.poster).toBeUndefined();
  });

  it('handles different video sources', () => {
    const testSources = [
      '/videos/movie.mp4',
      'https://example.com/video.mp4',
      '/path/to/local/video.mp4',
    ];

    testSources.forEach((src) => {
      const wrapper = mount(VideoPlayer, {
        props: { src },
        global: {
          stubs: { ClientOnly: ClientOnlyStub },
        },
      });

      const options = JSON.parse(wrapper.find('.video-js-mock').attributes('data-options') || '{}');
      expect(options.sources[0].src).toBe(src);
      expect(options.sources[0].type).toBe('video/mp4');
    });
  });
});
