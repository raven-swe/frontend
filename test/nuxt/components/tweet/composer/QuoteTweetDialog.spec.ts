import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import QuoteDialog from '~/components/tweet/composer/QuoteTweetDialog.vue';
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetQuoteCard from '~/components/tweet/TweetQuoteCard.vue';
import { useUserStore } from '@/stores/user';
import type { Tweet } from '~~/shared/types/tweets';

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

  const mockquoteToTweet: Tweet = {
    id: 'tweet-123',
    content: 'Original tweet content',
    author: {
      username: 'originalauthor',
      displayName: 'Original Author',
      avatarUrl: 'https://example.com/avatar.jpg',
      isFollowing: false,
    },
    createdAt: '2024-01-01T00:00:00Z',
    replyCount: 0,
    retweetCount: 0,
    likeCount: 0,
    isLiked: false,
    isRetweeted: false,
    media: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as unknown as Mock).mockReturnValue({
      user: mockUser,
    });
  });

  it('renders TweetComposer with correct reply-to-tweet-id', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        quoteToTweet: mockquoteToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    expect(composer.exists()).toBe(true);
    expect(composer.props('quoteToTweetId')).toBe('tweet-123');
    expect(composer.props('type')).toBe('quote');
  });

  it('renders TweetQuoteCard in reposted-tweet slot', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        quoteToTweet: mockquoteToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const card = wrapper.findComponent(TweetQuoteCard);
    expect(card.exists()).toBe(true);
    expect(card.props('tweet')).toEqual(mockquoteToTweet);
    expect(card.props('isPreview')).toBe(true);
  });

  it('emits update:open with false and quote-success when tweet is posted', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        quoteToTweet: mockquoteToTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    await composer.vm.$emit('post-success', { id: 'new-tweet' });

    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('syncs open prop with localOpen computed', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: false,
        quoteToTweet: mockquoteToTweet,
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

  it('v-model:open setter emits update when UiDialog requests change', async () => {
    const wrapper = await mountSuspended(QuoteDialog, {
      props: {
        open: true,
        quoteToTweet: mockquoteToTweet,
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
