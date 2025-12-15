import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Follow from '@/components/notifications/Follow.vue';

const mockActor = { username: 'actor1', avatarUrl: '/actor.jpg' };

const mockUser = {
  username: 'currentUser',
};

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: mockUser,
  }),
}));

describe('notifications/Follow.vue', () => {
  it('passes correct props to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Follow, {
      props: {
        timestamp: '2025-02-02T00:00:00Z',
        actors: [mockActor],
        totalActorsCount: 1,
        isSeen: false,
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
            template: '<div />',
          },
        },
      },
    });

    const nb = wrapper.findComponent({ name: 'NotificationsBase' });
    expect(nb.exists()).toBe(true);

    const nbProps = nb.props();
    expect(nbProps.messageKey).toBe('notifications.message.follow');
    expect(nbProps.timestamp).toBe('2025-02-02T00:00:00Z');
    expect(nbProps.icon).toBeDefined();
    expect(nbProps.icon.name).toBe('lucide:user-plus');
    expect(nbProps.icon.color).toBe('text-brand-blue');
    expect(nbProps.actors).toEqual([mockActor]);
    expect(nbProps.linkTo).toBe(`/profile/${mockUser.username}/followers`);
    expect(nbProps.isSeen).toBe(false);
  });

  it('forwards isSeen=true to NotificationsBase', async () => {
    const wrapper = await mountSuspended(Follow, {
      props: {
        timestamp: 't',
        actors: [mockActor],
        totalActorsCount: 1,
        isSeen: true,
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
            template: '<div />',
          },
        },
      },
    });

    const nbProps = wrapper.findComponent({ name: 'NotificationsBase' }).props();
    expect(nbProps.isSeen).toBe(true);
  });
});
