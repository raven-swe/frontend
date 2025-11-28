import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import QuoteDialog from '~/components/tweet/composer/QuoteTweetDialog.vue';
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { useUserStore } from '@/stores/user';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('QuoteDialog', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockReplyToTweet = {
    id: 'tweet-123',
    content: 'Original tweet content',
    author: {
      id: '2',
      username: 'originalauthor',
      displayName: 'Original Author',
    },
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    });
  });

  it('renders TweetComposer with correct reply-to-tweet-id', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        replyToTweet: mockReplyToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    expect(composer.exists()).toBe(true);
    expect(composer.props('replyToTweetId')).toBe('tweet-123');
    expect(composer.props('type')).toBe('quote');
  });

  it('renders TweetDefaultCard in reposted-tweet slot', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        replyToTweet: mockReplyToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const card = wrapper.findComponent(TweetDefaultCard);
    expect(card.exists()).toBe(true);
    expect(card.props('tweet')).toEqual(mockReplyToTweet);
    expect(card.props('isPreview')).toBe(true);
  });

  it('emits update:open with false when tweet is posted', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        replyToTweet: mockReplyToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    await composer.vm.$emit('posted', { id: 'new-tweet' });

    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('syncs open prop with localOpen computed', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: false,
        replyToTweet: mockReplyToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.setProps({ open: true });

    // Dialog should now be visible
    const composer = wrapper.findComponent(TweetComposer);
    expect(composer.exists()).toBe(true);
  });
});
