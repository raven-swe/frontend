import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Like from '@/components/notifications/Like.vue';

const mockActor = { username: 'actor1', avatarUrl: '/actor.jpg' };
const mockTweet = {
  id: '123',
  author: { username: 'tweetAuthor' },
  content: 'hello',
};

describe('notifications/Like.vue', () => {
  it('passes correct props to NotificationsBase and renders TweetQuoteCard in slot', async () => {
    const wrapper = await mountSuspended(Like, {
      props: {
        timestamp: '2025-01-10T00:00:00Z',
        actors: [mockActor],
        totalActorsCount: 1,
        isSeen: false,
        tweet: mockTweet,
      },
      global: {
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: [
              'messageKey',
              'messagePluralIndex',
              'messageParams',
              'displayActors',
              'timestamp',
              'icon',
              'actors',
              'linkTo',
              'isSeen',
            ],
            template: '<div><slot/></div>',
          },
          TweetQuoteCard: {
            name: 'TweetQuoteCard',
            props: ['tweet'],
            template: '<div class="tweet-card">{{ tweet.id }}</div>',
          },
        },
      },
    });

    const nb = wrapper.findComponent({ name: 'NotificationsBase' });
    expect(nb.exists()).toBe(true);

    const nbProps = nb.props();
    expect(nbProps.messageKey).toBe('notifications.message.like');
    expect(nbProps.timestamp).toBe('2025-01-10T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('lucide:heart');
    expect(nbProps.icon.color).toBe('text-brand-red');
    expect(nbProps.actors).toEqual([mockActor]);
    expect(nbProps.linkTo).toBe(
      `/profile/${mockTweet.author.username}/status/${mockTweet.id}/likes`,
    );
    expect(nbProps.isSeen).toBe(false);

    const tweetCard = wrapper.findComponent({ name: 'TweetQuoteCard' });
    expect(tweetCard.exists()).toBe(true);
    expect(tweetCard.props('tweet')).toEqual(mockTweet);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Like, {
      props: {
        timestamp: 't',
        actors: [mockActor],
        totalActorsCount: 1,
        isSeen: true,
        tweet: mockTweet,
      },
      global: {
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: [
              'messageKey',
              'messagePluralIndex',
              'messageParams',
              'displayActors',
              'timestamp',
              'icon',
              'actors',
              'linkTo',
              'isSeen',
            ],
            template: '<div><slot/></div>',
          },
          TweetQuoteCard: { name: 'TweetQuoteCard', props: ['tweet'], template: '<div/>' },
        },
      },
    });

    const nbProps = wrapper.findComponent({ name: 'NotificationsBase' }).props();
    expect(nbProps.isSeen).toBe(true);
  });
});
