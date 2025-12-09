import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import QuoteMention from '@/components/notifications/QuoteMention.vue';

const mockTweet = {
  id: '123',
  author: { username: 'tweetAuthor' },
  content: 'hello',
};

describe('notifications/QuoteMention.vue', () => {
  it('renders TweetDefaultCard and forwards tweet prop', async () => {
    const wrapper = await mountSuspended(QuoteMention, {
      props: { tweet: mockTweet },
      global: {
        stubs: {
          TweetDefaultCard: {
            name: 'TweetDefaultCard',
            props: ['tweet'],
            template: '<div class="tweet-default">{{ tweet.id }}</div>',
          },
        },
      },
    });

    const card = wrapper.findComponent({ name: 'TweetDefaultCard' });
    expect(card.exists()).toBe(true);
    expect(card.props('tweet')).toEqual(mockTweet);
    expect(wrapper.html()).toContain('123');
  });
});
