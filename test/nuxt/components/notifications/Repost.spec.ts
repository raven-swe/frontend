import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Repost from '@/components/notifications/Repost.vue';

const mockActor = { username: 'actor1', avatarUrl: '/actor.jpg' };
const mockTweet = {
  id: '123',
  author: { username: 'tweetAuthor' },
  content: 'hello',
};

describe('notifications/Repost.vue', () => {
  it('passes correct props to NotificationsBase and renders TweetQuoteCard in slot', async () => {
    const wrapper = await mountSuspended(Repost, {
      props: {
        timestamp: '2025-04-01T00:00:00Z',
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
    expect(nbProps.messageKey).toBe('notifications.message.repost');
    expect(nbProps.timestamp).toBe('2025-04-01T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('tabler:repeat');
    expect(nbProps.icon.color).toBe('text-brand-turquoise');
    expect(nbProps.actors).toEqual([mockActor]);
    expect(nbProps.linkTo).toBe(
      `/profile/${mockTweet.author.username}/status/${mockTweet.id}/reposts`,
    );
    expect(nbProps.isSeen).toBe(false);

    const tweetCard = wrapper.findComponent({ name: 'TweetQuoteCard' });
    expect(tweetCard.exists()).toBe(true);
    expect(tweetCard.props('tweet')).toEqual(mockTweet);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Repost, {
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
