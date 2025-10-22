import { describe, it, expect } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import ProfilePage from '~/pages/profile/index.vue';

describe('ProfilePage', () => {
  const createWrapper = async () =>
    await mountSuspended(ProfilePage, {
      global: {
        stubs: { TweetDefaultCard: true },
      },
    });

  it('renders the page', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders empty state when no tweets are available', async () => {
    const wrapper = await mountSuspended(ProfilePage, {
      global: { stubs: { TweetDefaultCard: true } },
    });

    await flushPromises();

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Tweet not found');
  });

  it('renders TweetDefaultCard components when tweets exist', async () => {
    const mockTweets = [
      {
        id: 'tweet-1',
        content: 'First tweet',
        createdAt: new Date().toISOString(),
        author: {
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: '/avatar.jpg',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
      {
        id: 'tweet-2',
        content: 'Second tweet',
        createdAt: new Date().toISOString(),
        author: {
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: '/avatar.jpg',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
    ];

    registerEndpoint('/api/tweets', () => ({
      data: mockTweets,
    }));

    const wrapper = await mountSuspended(ProfilePage, {
      global: { stubs: { TweetDefaultCard: true } },
    });

    await flushPromises();

    const tweetCards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(tweetCards.length).toBe(2);

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(false);
  });
});
