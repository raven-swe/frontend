import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import ReplyDialog from '~/components/tweet/composer/ReplyTweetDialog.vue';
import TweetComposer from '~/components/tweet/composer/TweetComposer.vue';
import TweetDefaultCard from '~/components/tweet/TweetDefaultCard.vue';
import { useUserStore } from '@/stores/user';
import type { Tweet } from '~~/shared/types/tweets';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

// Mock user store as TweetComposer depends on it in the app
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(),
}));

describe('ReplyTweetDialog', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockReplyTweet: Tweet = {
    id: 'tweet-456',
    content: 'Tweet to reply to',
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

  it('renders TweetComposer with correct reply-to-tweet-id and type', async () => {
    const wrapper = await mountSuspended(ReplyDialog, {
      props: {
        open: true,
        replyTweet: mockReplyTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    expect(composer.exists()).toBe(true);
    expect(composer.props('replyToTweetId')).toBe('tweet-456');
    expect(composer.props('type')).toBe('reply');
  });

  it('renders TweetDefaultCard with expected props', async () => {
    const wrapper = await mountSuspended(ReplyDialog, {
      props: {
        open: true,
        replyTweet: mockReplyTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const card = wrapper.findComponent(TweetDefaultCard);
    expect(card.exists()).toBe(true);
    expect(card.props('tweetId')).toEqual(mockReplyTweet.id);
    expect(card.props('isRoot')).toBe(true);
    expect(card.props('noActions')).toBe(true);
  });

  it('emits update:open=false when a reply is posted', async () => {
    const wrapper = await mountSuspended(ReplyDialog, {
      props: {
        open: true,
        replyTweet: mockReplyTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const composer = wrapper.findComponent(TweetComposer);
    const newReply = { id: 'new-reply' } as unknown as Tweet;
    await composer.vm.$emit('post-success', newReply);

    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('syncs open prop with localOpen computed (dialog visibility)', async () => {
    const wrapper = await mountSuspended(ReplyDialog, {
      props: {
        open: false,
        replyTweet: mockReplyTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    // Initially closed; opening should render children
    await wrapper.setProps({ open: true });

    const composer = wrapper.findComponent(TweetComposer);
    expect(composer.exists()).toBe(true);
  });

  it('v-model:open setter emits update when UiDialog requests change', async () => {
    const wrapper = await mountSuspended(ReplyDialog, {
      props: {
        open: true,
        replyTweet: mockReplyTweet,
      },
      global: {
        plugins: [i18n],
      },
    });

    const dialog = wrapper.findComponent({ name: 'UiDialog' });
    expect(dialog.exists()).toBe(true);

    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:open')).toBeTruthy();
    // Last emission should reflect setter from v-model
    const emissions = wrapper.emitted('update:open') as boolean[][];
    expect(emissions[emissions.length - 1]).toEqual([false]);
  });
});
