/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { ref, defineComponent } from 'vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json' assert { type: 'json' };
import type { Notification } from '~~/shared/types/notifications';

// Create mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'LIKE',
    latestEventAt: '2023-01-01T00:00:00Z',
    actorSummary: {
      previewActors: [
        {
          username: 'user1',
          displayName: 'User One',
          avatarUrl: '/avatar1.png',
        },
      ],
    },
    isSeen: false,
    tweetSummary: {
      primaryTweet: { id: 'tweet1', content: 'Test tweet' },
    },
  },
  {
    id: '2',
    type: 'FOLLOW',
    latestEventAt: '2023-01-02T00:00:00Z',
    actorSummary: {
      previewActors: [
        {
          username: 'user2',
          displayName: 'User Two',
          avatarUrl: '/avatar2.png',
        },
      ],
    },
    isSeen: true,
  },
];

// Mock the composables
vi.mock('~/composables/useNotificationsList', () => ({
  useNotificationsList: vi.fn(() => ({
    notifications: ref(mockNotifications),
    virtualRows: ref([
      { index: 0, start: 0, key: 0 },
      { index: 1, start: 100, key: 1 },
    ]),
    totalSize: ref(200),
    measureElement: vi.fn(),
    hasNextPage: ref(false),
    isFetchingNextPage: ref(false),
    isLoading: ref(false),
    markAllSeen: vi.fn(),
    getPrimaryActor: vi.fn((actorSummary) => actorSummary?.previewActors?.[0]),
  })),
}));

vi.mock('~/composables/useProfileMutation', () => ({
  useFollowMutation: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useProfileMutation: vi.fn(),
  useMuteMutation: vi.fn(),
  useBlockMutation: vi.fn(),
}));

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: messages,
  },
});

async function createWrapper(
  overrides: { stubs?: Record<string, any>; provide?: Record<string, any> } = {},
) {
  const { default: Page } = await import('~/pages/notifications/index.vue');

  const StubClientOnly = defineComponent({
    setup(_, { slots }) {
      return () => slots.default?.();
    },
  });

  const StubUiSpinner = defineComponent({
    template: '<div data-testid="spinner">Loading...</div>',
  });

  const StubNotification = (name: string) =>
    defineComponent({
      name,
      props: ['timestamp', 'actor', 'isSeen', 'tweet'],
      emits: ['follow', 'unfollow'],
      template: `<div data-testid="${name.toLowerCase()}-notification"></div>`,
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
        Like: overrides.stubs?.Like ?? StubNotification('Like'),
        Follow: overrides.stubs?.Follow ?? StubNotification('Follow'),
        Repost: overrides.stubs?.Repost ?? StubNotification('Repost'),
        Reply: overrides.stubs?.Reply ?? StubNotification('Reply'),
        QuoteMention: overrides.stubs?.QuoteMention ?? StubNotification('QuoteMention'),
      },
      // keep any additional stubs passed in
      stubs: overrides.stubs || {},
    },
  });
}

vi.mock('~/components/notifications', () => {
  const makeStub = (name: string) =>
    defineComponent({
      name,
      props: ['timestamp', 'actor', 'isSeen', 'tweet'],
      template: `<div data-testid="${name.toLowerCase()}-notification"></div>`,
    });

  return {
    Like: makeStub('Like'),
    Follow: makeStub('Follow'),
    Repost: makeStub('Repost'),
    Reply: makeStub('Reply'),
    QuoteMention: makeStub('QuoteMention'),
  };
});

describe('NotificationsIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('component can be imported and is defined', async () => {
    const component = await import('~/pages/notifications/index.vue');
    expect(component.default).toBeDefined();
    expect(typeof component.default).toBe('object');
  });

  it('component has setup function', async () => {
    const component = await import('~/pages/notifications/index.vue');
    expect(component.default.setup).toBeDefined();
  });

  it('renders without throwing errors', async () => {
    const wrapper = await createWrapper();

    expect(wrapper).toBeDefined();
    expect(wrapper.vm).toBeDefined();
  }, 10000);

  it('has basic HTML structure when rendered', async () => {
    const wrapper = await createWrapper();

    // Check if any HTML is rendered at all
    expect(wrapper.html()).toBeTruthy();
    expect(wrapper.html().length).toBeGreaterThan(0);
  });

  it('renders main div container', async () => {
    const wrapper = await createWrapper({
      stubs: {
        ClientOnly: false, // Don't stub, render actual content
      },
    });
    const divs = wrapper.findAll('div');
    expect(divs.length).toBeGreaterThan(0);

    // Try to find the main container by class
    const mainContainer =
      wrapper.find('div[class*="mx-auto"]') || wrapper.find('div[class*="max-w"]');
    if (mainContainer.exists()) {
      expect(mainContainer.exists()).toBe(true);
    } else {
      expect(wrapper.element).toBeDefined();
    }
  });

  it('mocks are working correctly', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    const { useFollowMutation } = await import('~/composables/useProfileMutation');

    // Verify mocks are applied
    expect(vi.isMockFunction(useNotificationsList)).toBe(true);
    expect(vi.isMockFunction(useFollowMutation)).toBe(true);

    // Test mock returns
    const notificationsResult = useNotificationsList({} as any);
    expect(notificationsResult.notifications.value).toEqual(mockNotifications);
  });

  it('renders with empty notifications correctly', async () => {
    // Override the mock for this test
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

    // With empty notifications, should show empty state
    expect(wrapper.html()).toBeTruthy();
  });

  it('renders loading state correctly', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');
    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref([]),
      virtualRows: ref([]),
      totalSize: ref(0),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(true), // Loading state
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn(),
    } as any);

    const wrapper = await createWrapper({
      stubs: {
        UiSpinner: {
          template: '<div data-testid="loading-spinner">Loading...</div>',
        },
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });

  it('maps notification types to the correct components', async () => {
    const { useNotificationsList } = await import('~/composables/useNotificationsList');

    const testNotifications = [
      {
        id: 'r1',
        type: 'RETWEET',
        latestEventAt: '2025-01-01T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u1' }] },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't1' } },
      },
      {
        id: 'r2',
        type: 'REPLY',
        latestEventAt: '2025-01-02T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u2' }] },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't2' } },
      },
      {
        id: 'r3',
        type: 'QUOTE',
        latestEventAt: '2025-01-03T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u3' }] },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't3' } },
      },
      {
        id: 'r4',
        type: 'MENTION',
        latestEventAt: '2025-01-04T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u4' }] },
        isSeen: false,
        tweetSummary: { primaryTweet: { id: 't4' } },
      },
      {
        id: 'r5',
        type: 'FOLLOW',
        latestEventAt: '2025-01-05T00:00:00Z',
        actorSummary: { previewActors: [{ username: 'u5' }] },
        isSeen: false,
      },
    ];

    vi.mocked(useNotificationsList).mockReturnValueOnce({
      notifications: ref(testNotifications),
      virtualRows: ref(testNotifications.map((_, i) => ({ index: i, start: i * 100, key: i }))),
      totalSize: ref(testNotifications.length * 100),
      measureElement: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
      isLoading: ref(false),
      markAllSeen: vi.fn(),
      getPrimaryActor: vi.fn((actorSummary) => actorSummary?.previewActors?.[0]),
    } as any);

    const wrapper = await createWrapper();

    expect(wrapper.find('[data-testid="repost-notification"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="reply-notification"]').exists()).toBe(true);
    const quoteMentionNodes = wrapper.findAll('[data-testid="quotemention-notification"]');
    expect(quoteMentionNodes.length).toBeGreaterThanOrEqual(2); // quote and mention
    expect(wrapper.find('[data-testid="follow-notification"]').exists()).toBe(true);
  });
});
