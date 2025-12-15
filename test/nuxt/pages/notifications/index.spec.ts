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
    getActors: vi.fn((actorSummary) => actorSummary?.previewActors || []),
    getTotalActorsCount: vi.fn((actorSummary) => actorSummary?.totalCount || 0),
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

// Mock the notification components to avoid rendering them and causing timeouts
vi.mock('~/components/notifications', () => {
  const Stub = (name: string) =>
    defineComponent({
      name,
      props: [
        'timestamp',
        'actor',
        'isSeen',
        'tweet',
        'messageKey',
        'messageParams',
        'displayActors',
        'actors',
        'icon',
        'linkTo',
      ],
      setup() {
        return { componentName: name };
      },
      template: `<div :data-type="componentName"></div>`,
    });
  return {
    Follow: Stub('Follow'),
    Like: Stub('Like'),
    Repost: Stub('Repost'),
    Reply: Stub('Reply'),
    QuoteMention: Stub('QuoteMention'),
  };
});

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

  return mountSuspended(Page, {
    global: {
      plugins: [i18n],
      stubs: {
        ClientOnly: StubClientOnly,
        UiSpinner: StubUiSpinner,
        ...overrides.stubs,
      },
      provide: {
        lastNotification: ref(null),
        unseenNotificationsCount: ref(0),
        ...overrides.provide,
      },
    },
  });
}

describe('pages/notifications/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the list of notifications', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('[data-testid="notifications-list"]').exists()).toBe(true);
  });

  it('maps notification types to the correct components', async () => {
    const wrapper = await createWrapper();

    // Check if the mocked components are rendered
    // The mock template is <div :data-type="name"></div>
    // mockNotifications[0] is LIKE
    // mockNotifications[1] is FOLLOW

    const likeComponent = wrapper.find('[data-type="Like"]');
    expect(likeComponent.exists()).toBe(true);

    const followComponent = wrapper.find('[data-type="Follow"]');
    expect(followComponent.exists()).toBe(true);
  });
});
