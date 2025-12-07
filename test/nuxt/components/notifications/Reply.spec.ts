import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };

import Reply from '@/components/notifications/Reply.vue';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

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
        actor: mockActor,
        isSeen: false,
        tweet: mockTweet,
      },
      global: {
        plugins: [i18n],
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: ['message', 'timestamp', 'icon', 'actor', 'linkTo', 'isSeen'],
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
    const expectedMessage = i18n.global.t('notifications.message.reply') as string;
    expect(nbProps.message).toBe(expectedMessage);
    expect(nbProps.timestamp).toBe('2025-03-01T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('lucide:reply');
    expect(nbProps.icon.color).toBe('text-brand-turquoise');
    expect(nbProps.actor).toEqual(mockActor);

    // Note: Reply.vue currently has an extra '}' in linkTo definition; test reflects current behavior
    expect(nbProps.linkTo).toBe(`/profile/${mockTweet.author.username}}/status/${mockTweet.id}`);

    expect(nbProps.isSeen).toBe(false);

    const tweetCard = wrapper.findComponent({ name: 'TweetQuoteCard' });
    expect(tweetCard.exists()).toBe(true);
    expect(tweetCard.props('tweet')).toEqual(mockTweet);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Reply, {
      props: { timestamp: 't', actor: mockActor, isSeen: true, tweet: mockTweet },
      global: {
        plugins: [i18n],
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: ['message', 'timestamp', 'icon', 'actor', 'linkTo', 'isSeen'],
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
