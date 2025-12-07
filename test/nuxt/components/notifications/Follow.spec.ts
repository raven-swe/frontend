import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };

import Follow from '@/components/notifications/Follow.vue';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

const mockActor = { username: 'actor1', avatarUrl: '/actor.jpg' };

describe('notifications/Follow.vue', () => {
  it('passes correct props to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Follow, {
      props: {
        timestamp: '2025-02-02T00:00:00Z',
        actor: mockActor,
        isSeen: false,
      },
      global: {
        plugins: [i18n],
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: ['type', 'message', 'timestamp', 'icon', 'actor', 'linkTo', 'isSeen'],
            template: '<div />',
          },
        },
      },
    });

    const nb = wrapper.findComponent({ name: 'NotificationsBase' });
    expect(nb.exists()).toBe(true);

    const nbProps = nb.props();
    const expectedMessage = i18n.global.t('notifications.message.follow') as string;
    expect(nbProps.type).toBe('FOLLOW');
    expect(nbProps.message).toBe(expectedMessage);
    expect(nbProps.timestamp).toBe('2025-02-02T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('lucide:user-plus');
    expect(nbProps.icon.color).toBe('text-brand-blue');
    expect(nbProps.actor).toEqual(mockActor);
    expect(nbProps.linkTo).toBe(`/profile/${mockActor.username}`);
    expect(nbProps.isSeen).toBe(false);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Follow, {
      props: { timestamp: 't', actor: mockActor, isSeen: true },
      global: {
        plugins: [i18n],
        stubs: {
          NotificationsBase: {
            name: 'NotificationsBase',
            props: ['type', 'message', 'timestamp', 'icon', 'actor', 'linkTo', 'isSeen'],
            template: '<div />',
          },
        },
      },
    });

    const nbProps = wrapper.findComponent({ name: 'NotificationsBase' }).props();
    expect(nbProps.isSeen).toBe(true);
  });
});
