import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Reply from '@/components/notifications/Reply.vue';

const mockActor = { username: 'actor1', avatarUrl: '/actor.jpg' };
const mockTweet = {
  id: '123',
  author: { username: 'tweetAuthor' },
  content: 'hello',
};

describe('notifications/Reply.vue', () => {
  it('passes correct props to NotificationsBase and renders TweetQuoteCard in slot', async () => {
    const wrapper = await mountSuspended(Reply, {
      props: {
        timestamp: '2025-03-01T00:00:00Z',
        actors: [mockActor],
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
    expect(nbProps.messageKey).toBe('notifications.message.reply');
    expect(nbProps.timestamp).toBe('2025-03-01T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('lucide:reply');
    expect(nbProps.icon.color).toBe('text-brand-turquoise');
    expect(nbProps.actors).toEqual([mockActor]);
    expect(nbProps.linkTo).toBe(`/profile/${mockTweet.author.username}/status/${mockTweet.id}`);
    expect(nbProps.isSeen).toBe(false);

    const tweetCard = wrapper.findComponent({ name: 'TweetQuoteCard' });
    expect(tweetCard.exists()).toBe(true);
    expect(tweetCard.props('tweet')).toEqual(mockTweet);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Reply, {
      props: {
        timestamp: 't',
        actors: [mockActor],
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
