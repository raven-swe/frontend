import { it, describe, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetEngagementLayout from '~/layouts/tweet-engagement.vue';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import type { Tweet } from '#shared/types/tweets';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

// Mock the profileTabsService

const mockTweet: Tweet = {
  id: '12345',
  content: 'This is a mock tweet content.',
  author: {
    avatarUrl: 'https://example.com/avatar.jpg',
    displayName: 'Mock User',
    username: 'mockuser',
    isFollowing: false,
    isBlocked: false,
  },
  createdAt: new Date().toISOString(),
  isLiked: false,
  isRetweeted: false,
  likeCount: 10,
  retweetCount: 5,
  media: [],
  replyCount: 2,
  entities: {
    hashtags: [],
    mentions: [],
  },
  quotedTweet: null,
  quoteToTweetId: null,
  replyToTweetId: null,
  replyToTweet: null,
};

const tweetServiceMock = vi.hoisted(() => ({
  tweet: vi.fn((id: string) => {
    return {
      sucess: true,
      data: {
        ...mockTweet,
        id,
      },
    };
  }),
}));

vi.mock('~/services/tweet/tweetsService', () => ({
  tweetsService: tweetServiceMock,
}));

describe('Tweet Engagement Layout', () => {
  it('renders tweet engagement content', async () => {
    const wrapper = await mountSuspended(TweetEngagementLayout, {
      slots: {
        default: '<div class="engagement-content">Tweet Engagement Content</div>',
      },
      route: {
        path: '/profile/testuser/status/12345/likes',
      },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.html()).toContain('Tweet Engagement Content');
    expect(tweetServiceMock.tweet).toHaveBeenCalledWith('12345');
  });

  it('renders back button with correct link', async () => {
    const routerMock = vi.fn();
    const wrapper = await mountSuspended(TweetEngagementLayout, {
      route: {
        path: '/profile/testuser/status/12345/likes',
      },
      global: {
        plugins: [i18n],
        mocks: {
          $router: {
            back: routerMock,
          },
        },
      },
    });

    const backButton = wrapper.find('[data-test="back-button"]');
    expect(backButton.exists()).toBe(true);
    await backButton.trigger('click');
    expect(routerMock).toHaveBeenCalled();
  });
});
