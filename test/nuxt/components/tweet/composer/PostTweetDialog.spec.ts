import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import PostTweetDialog from '~/components/tweet/composer/PostTweetDialog.vue';
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import { useUserStore } from '@/stores/user';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

// Mock user store as TweetComposer depends on it in the app
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('PostTweetDialog', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as unknown as Mock).mockReturnValue({
      user: mockUser,
    });
  });

  describe('Rendering', () => {
    it('renders TweetComposer when dialog is open', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const composer = wrapper.findComponent(TweetComposer);
      expect(composer.exists()).toBe(true);
    });

    it('renders UiDialog component', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.exists()).toBe(true);
    });

    it('renders UiDialogContent with correct classes', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialogContent = wrapper.findComponent({ name: 'UiDialogContent' });
      expect(dialogContent.exists()).toBe(true);
      expect(dialogContent.props('contentHeight')).toBe('h-auto max-h-[95vh]');
    });
  });

  describe('Dialog State Management', () => {
    it('syncs open prop with localOpen computed (dialog visibility)', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      // Initially closed
      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.props('open')).toBe(false);

      // Opening should update dialog
      await wrapper.setProps({ open: true });
      expect(dialog.props('open')).toBe(true);

      const composer = wrapper.findComponent(TweetComposer);
      expect(composer.exists()).toBe(true);
    });

    it('defaults to false when open prop is not provided', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.props('open')).toBe(false);
    });

    it('v-model:open setter emits update when UiDialog requests change', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.exists()).toBe(true);

      await dialog.vm.$emit('update:open', false);

      expect(wrapper.emitted('update:open')).toBeTruthy();
      const emissions = wrapper.emitted('update:open') as boolean[][];
      expect(emissions[emissions.length - 1]).toEqual([false]);
    });
  });

  describe('Tweet Posting', () => {
    it('emits update:open=false when a tweet is posted', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const composer = wrapper.findComponent(TweetComposer);

      await composer.vm.$emit('post-success');

      expect(wrapper.emitted('update:open')).toBeTruthy();
      expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
    });

    it('closes dialog after successful post', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const composer = wrapper.findComponent(TweetComposer);
      expect(composer.exists()).toBe(true);

      // Simulate successful tweet post
      await composer.vm.$emit('post-success');

      // Should emit update:open with false
      const emissions = wrapper.emitted('update:open') as boolean[][];
      expect(emissions).toBeTruthy();
      expect(emissions[emissions.length - 1]).toEqual([false]);
    });
  });

  describe('Props', () => {
    it('accepts open prop as true', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.props('open')).toBe(true);
    });

    it('accepts open prop as false', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.props('open')).toBe(false);
    });
  });

  describe('Events', () => {
    it('emits update:open event', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      await dialog.vm.$emit('update:open', false);

      expect(wrapper.emitted()).toHaveProperty('update:open');
    });

    it('handles multiple open/close cycles', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      const dialog = wrapper.findComponent({ name: 'UiDialog' });

      // Open
      await wrapper.setProps({ open: true });
      expect(dialog.props('open')).toBe(true);

      // Close
      await wrapper.setProps({ open: false });
      expect(dialog.props('open')).toBe(false);

      // Open again
      await wrapper.setProps({ open: true });
      expect(dialog.props('open')).toBe(true);
    });
  });

  describe('Integration', () => {
    it('complete flow: open dialog, post tweet, close dialog', async () => {
      const wrapper = await mountSuspended(PostTweetDialog, {
        props: {
          open: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      // Dialog initially closed
      const dialog = wrapper.findComponent({ name: 'UiDialog' });
      expect(dialog.props('open')).toBe(false);

      // Open dialog
      await wrapper.setProps({ open: true });
      expect(dialog.props('open')).toBe(true);

      // Post tweet
      const composer = wrapper.findComponent(TweetComposer);
      await composer.vm.$emit('post-success');

      // Should emit close
      expect(wrapper.emitted('update:open')).toBeTruthy();
      const emissions = wrapper.emitted('update:open') as boolean[][];
      expect(emissions[emissions.length - 1]).toEqual([false]);
    });
  });
});
