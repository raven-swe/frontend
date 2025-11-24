import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetEditor from '~/components/tweet/composer/TweetEditor.vue';
import Toolbar from '~/components/tweet/composer/Toolbar.vue';
import MediaSlideshow from '~/components/tweet/composer/MediaSlideshow.vue';
import { useUserStore } from '@/stores/user';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('TweetComposer', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    });
  });

  it('renders correctly with user avatar', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe(mockUser.avatarUrl);
  });

  it('renders TweetEditor component', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.findComponent(TweetEditor).exists()).toBe(true);
  });

  it('renders Toolbar component', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.findComponent(Toolbar).exists()).toBe(true);
  });

  it('renders MediaSlideshow component', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.findComponent(MediaSlideshow).exists()).toBe(true);
  });

  it('initializes with empty content', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const editor = wrapper.findComponent(TweetEditor);
    expect(editor.props('modelValue')).toBe('');
  });

  it('updates character count when content changes', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const editor = wrapper.findComponent(TweetEditor);
    await editor.vm.$emit('update:modelValue', 'Hello world');

    const toolbar = wrapper.findComponent(Toolbar);
    expect(toolbar.props('characterCount')).toBe(11);
  });

  it('detects when over character limit', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const editor = wrapper.findComponent(TweetEditor);
    await editor.vm.$emit('update:modelValue', 'a'.repeat(300));

    const toolbar = wrapper.findComponent(Toolbar);
    expect(toolbar.props('isOverLimit')).toBe(true);
  });

  it('disables toolbar when content is empty and no media', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const toolbar = wrapper.findComponent(Toolbar);
    expect(toolbar.props('disabled')).toBe(true);
  });

  it('enables toolbar when content is not empty', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const editor = wrapper.findComponent(TweetEditor);
    await editor.vm.$emit('update:modelValue', 'Test');

    const toolbar = wrapper.findComponent(Toolbar);
    expect(toolbar.props('disabled')).toBe(false);
  });

  it('handles adding media', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const toolbar = wrapper.findComponent(Toolbar);

    await toolbar.vm.$emit('add-media', [mockFile]);

    const slideshow = wrapper.findComponent(MediaSlideshow);
    expect(slideshow.props('media')).toHaveLength(1);
    expect(slideshow.props('media')[0].file).toStrictEqual(mockFile);
  });

  it('limits media to MAX_MEDIA (4)', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFiles = Array.from(
      { length: 5 },
      (_, i) => new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' }),
    );

    const toolbar = wrapper.findComponent(Toolbar);
    await toolbar.vm.$emit('add-media', mockFiles);

    const slideshow = wrapper.findComponent(MediaSlideshow);
    expect(slideshow.props('media')).toHaveLength(4);
  });

  it('handles removing media', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const toolbar = wrapper.findComponent(Toolbar);
    await toolbar.vm.$emit('add-media', [mockFile]);

    const slideshow = wrapper.findComponent(MediaSlideshow);
    const mediaId = slideshow.props('media')[0].id;

    await slideshow.vm.$emit('remove', mediaId);

    expect(slideshow.props('media')).toHaveLength(0);
  });

  it('enables toolbar when media is added even without text', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const toolbar = wrapper.findComponent(Toolbar);

    await toolbar.vm.$emit('add-media', [mockFile]);

    expect(toolbar.props('disabled')).toBe(false);
    expect(toolbar.props('hasMedia')).toBe(true);
  });

  it('updates canAddMedia when media count changes', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const toolbar = wrapper.findComponent(Toolbar);
    expect(toolbar.props('canAddMedia')).toBe(true);

    const mockFiles = Array.from(
      { length: 4 },
      (_, i) => new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' }),
    );

    await toolbar.vm.$emit('add-media', mockFiles);

    expect(toolbar.props('canAddMedia')).toBe(false);
  });

  it('does not post when content is empty and no media', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const toolbar = wrapper.findComponent(Toolbar);
    await toolbar.vm.$emit('post');

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('does not post when over character limit', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const editor = wrapper.findComponent(TweetEditor);
    await editor.vm.$emit('update:modelValue', 'a'.repeat(300));

    const toolbar = wrapper.findComponent(Toolbar);
    await toolbar.vm.$emit('post');

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('generates unique IDs for media items', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
    ];

    const toolbar = wrapper.findComponent(Toolbar);
    await toolbar.vm.$emit('add-media', mockFiles);

    const slideshow = wrapper.findComponent(MediaSlideshow);
    const media = slideshow.props('media');
    if (!media) {
      // just to silence ts
      throw new Error('Media prop is undefined');
    }

    expect(media[0]?.id).not.toBe(media[1]?.id);
    expect(media[0]?.id).toBeTruthy();
    expect(media[1]?.id).toBeTruthy();
  });

  it('creates blob URLs for media items', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const toolbar = wrapper.findComponent(Toolbar);

    await toolbar.vm.$emit('add-media', [mockFile]);

    const slideshow = wrapper.findComponent(MediaSlideshow);
    const media = slideshow.props('media');
    if (!media) {
      // just to silence ts
      throw new Error('Media prop is undefined');
    }

    expect(media[0]?.url).toMatch(/^blob:/);
  });

  it('renders slot for reposted tweet', async () => {
    const wrapper = await mountSuspended(TweetComposer, {
      global: {
        plugins: [i18n],
      },
      slots: {
        'reposted-tweet': '<div class="reposted-content">Reposted tweet</div>',
      },
    });

    expect(wrapper.find('.reposted-content').exists()).toBe(true);
    expect(wrapper.find('.reposted-content').text()).toBe('Reposted tweet');
  });
});
