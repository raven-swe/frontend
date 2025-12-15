/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { ref, defineComponent, nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };
import type { Notification } from '~~/shared/types/notifications';

const defaultNotifications: Notification[] = [
  {
    id: 'm1',
    type: 'MENTION',
    latestEventAt: '2025-01-01T00:00:00Z',
    actorSummary: { previewActors: [{ username: 'a1', displayName: 'a1', avatarUrl: '' }] },
    isSeen: true,
    tweetSummary: { primaryTweet: { id: 't1', content: 'c' } },
  },
];

vi.mock('~/composables/useProfileMutation', () => ({
  useFollowMutation: vi.fn(() => ({ mutate: vi.fn() })),
  useProfileMutation: vi.fn(),
  useMuteMutation: vi.fn(),
  useBlockMutation: vi.fn(),
}));

vi.mock('~/composables/useNotificationsList', () => ({
  useNotificationsList: vi.fn(() => ({
    notifications: ref(defaultNotifications),
    virtualRows: ref([{ index: 0, start: 0, key: 0 }]),
    totalSize: ref(100),
    measureElement: vi.fn(),
    hasNextPage: ref(false),
    isFetchingNextPage: ref(false),
    isLoading: ref(false),
    markAllSeen: vi.fn(),
    getPrimaryActor: vi.fn((actorSummary: any) => actorSummary?.previewActors?.[0]),
  })),
}));

// stub the notification component(s)
vi.mock('~/components/notifications', () => {
  return {
    QuoteMention: defineComponent({
      name: 'QuoteMention',
      props: ['timestamp', 'actor', 'isSeen', 'tweet'],
      template: `<div data-testid="quotemention-notification"></div>`,
    }),
  };
});

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

async function createWrapper(
  overrides: { provide?: Record<string, any>; stubs?: Record<string, any> } = {},
) {
  const { default: Page } = await import('~/pages/notifications/mentions.vue');

  const StubClientOnly = defineComponent({
    setup(_, { slots }) {
      return () => slots.default?.();
    },
  });

  const StubUiSpinner = defineComponent({
    template: '<div data-testid="spinner">Loading...</div>',
  });

  return await mountSuspended(Page, {
    global: {
      plugins: [i18n],
      provide: {
        lastNotification: ref(null),
        unseenNotificationsCount: ref(0),
        ...(overrides.provide || {}),
      },
      components: {
        ClientOnly: overrides.stubs?.ClientOnly ?? StubClientOnly,
        UiSpinner: overrides.stubs?.UiSpinner ?? StubUiSpinner,
      },
      stubs: overrides.stubs || {},
    },
  });
}

describe('NotificationsMentionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('page can be imported and is defined', async () => {
    const module = await import('~/pages/notifications/mentions.vue');
    expect(module.default).toBeDefined();
  });

  it('page has setup function', async () => {
    const module = await import('~/pages/notifications/mentions.vue');
    expect(module.default.setup).toBeDefined();
  });

  it('renders without throwing errors', async () => {
    const wrapper = await createWrapper();
    expect(wrapper).toBeDefined();
    expect(wrapper.vm).toBeDefined();
  }, 10000);

  it('renders basic HTML structure', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.find('[data-testid="quotemention-notification"]').exists()).toBe(true);
  });

  it('renders empty state when there are no mentions', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref([]),
      virtualRows: ref([]),
      totalSize: ref(0),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn(),
    } as any);

    const wrapper = await createWrapper();
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it('renders loading spinner when loading', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref([]),
      virtualRows: ref([]),
      totalSize: ref(0),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(true),
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn(),
    } as any);

    const wrapper = await createWrapper({
      stubs: { UiSpinner: { template: '<div data-testid="loading-spinner">Loading</div>' } },
    });
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it('calls markAllSeen and clears unseenNotificationsCount when there are unseen items', async () => {
    vi.useFakeTimers();
    const markAllSeen = vi.fn();
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    const testNotifications = [
      {
        id: 'x1',
        type: 'MENTION',
        latestEventAt: '2025-01-01T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u1' }] },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't1' } },
      },
    ];

    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref(testNotifications),
      virtualRows: ref([{ index: 0, start: 0, key: 0 }]),
      totalSize: ref(100),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
      markAllSeen,
      getPrimaryActor: vi.fn((actorSummary: any) => actorSummary?.previewActors?.[0]),
    } as any);

    const unseenRef = ref(3);
    const wrapper = await createWrapper({ provide: { unseenNotificationsCount: unseenRef } });

    // allow lifecycle to run
    await wrapper.vm.$nextTick();

    vi.advanceTimersByTime(600);

    expect(markAllSeen).toHaveBeenCalled();
    expect(unseenRef.value).toBe(0);
    vi.useRealTimers();
  });

  it('passes correct props to QuoteMention', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');

    const testNotifications = [
      {
        id: 'p1',
        type: 'MENTION',
        latestEventAt: '2025-06-01T12:00:00Z',
        actorSummary: {
          previewActors: [{ username: 'actor-prop', displayName: 'AP', avatarUrl: '' }],
        },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 'tweet-prop', content: 'hello' } },
      },
    ];

    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref(testNotifications),
      virtualRows: ref([{ index: 0, start: 0, key: 0 }]),
      totalSize: ref(100),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn((actorSummary: any) => actorSummary?.previewActors?.[0]),
    } as any);

    const QuoteMentionStub = defineComponent({
      name: 'QuoteMention',
      props: ['timestamp', 'actor', 'isSeen', 'tweet'],
      template:
        '<div data-testid="quotemention-props" :data-ts="timestamp" :data-actor="actor?.username" :data-seen="isSeen" :data-tid="tweet?.id"></div>',
    });

    const wrapper = await createWrapper({ stubs: { QuoteMention: QuoteMentionStub } });

    const node = wrapper.find('[data-testid="quotemention-props"]');
    expect(node.exists()).toBe(true);
    expect(node.attributes('data-ts')).toBe('2025-06-01T12:00:00Z'); // timestamp prop
    expect(node.attributes('data-actor')).toBe('actor-prop'); // actor.username from getPrimaryActor
    expect(node.attributes('data-seen')).toBe('false'); // isSeen prop
    expect(node.attributes('data-tid')).toBe('tweet-prop'); // tweet.id prop
  });

  it('calls followUser mutate when QuoteMention emits follow/unfollow', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    const { useFollowMutation } = await import('~/composables/useProfileMutation');

    const testNotifications = [
      {
        id: 'p2',
        type: 'MENTION',
        latestEventAt: '2025-06-02T12:00:00Z',
        actorSummary: {
          previewActors: [{ username: 'actor-action', displayName: 'AA', avatarUrl: '' }],
        },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 'tweet-action', content: 'hi' } },
      },
    ];

    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref(testNotifications),
      virtualRows: ref([{ index: 0, start: 0, key: 0 }]),
      totalSize: ref(100),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn((actorSummary: any) => actorSummary?.previewActors?.[0]),
    } as any);

    const mutateSpy = vi.fn();
    vi.mocked(useFollowMutation).mockReturnValueOnce({ mutate: mutateSpy } as any);

    const QuoteMentionActionStub = defineComponent({
      name: 'QuoteMention',
      props: ['timestamp', 'actor', 'isSeen', 'tweet'],
      template:
        '<div><button data-testid="btn-follow" @click="$emit(\'follow\')">f</button><button data-testid="btn-unfollow" @click="$emit(\'unfollow\')">u</button></div>',
    });

    const wrapper = await createWrapper({ stubs: { QuoteMention: QuoteMentionActionStub } });

    // trigger follow
    await wrapper.find('[data-testid="btn-follow"]').trigger('click');
    await nextTick();

    expect(mutateSpy).toHaveBeenCalledWith({
      username: 'actor-action',
      action: 'follow',
    });

    // trigger unfollow
    await wrapper.find('[data-testid="btn-unfollow"]').trigger('click');
    await nextTick();

    expect(mutateSpy).toHaveBeenCalledWith({
      username: 'actor-action',
      action: 'unfollow',
    });
    // ensure called twice total
    expect(mutateSpy).toHaveBeenCalledTimes(2);
  });
});
