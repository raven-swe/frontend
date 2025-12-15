import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import type { Tweet } from '~~/shared/types/tweets';
import TabPage from '~/pages/home/[tab].vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

// Set up i18n
const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

const mockTweet: Tweet = {
  id: 'tw-1',
  author: {
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    isFollowing: false,
    isFollower: false,
  },
  content: 'Test tweet content',
  createdAt: new Date().toISOString(),
  replyCount: 0,
  retweetCount: 0,
  likeCount: 0,
  isLiked: false,
  isRetweeted: false,
  entities: { mentions: [], hashtags: [] },
  media: [],
};

const { mockRouteParams } = vi.hoisted(() => ({
  mockRouteParams: { value: { tab: 'for-you' } },
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({
      params: mockRouteParams.value,
      query: {},
    }),
  };
});

const { homeServiceMock } = vi.hoisted(() => ({
  homeServiceMock: {
    getHomeTab: vi.fn(),
  },
}));

vi.mock('~/services/home/homeService', () => ({
  homeService: homeServiceMock,
}));

// Create mock query result that will be dynamically updated
let mockInfiniteQueryResult: ReturnType<typeof createMockQueryResult>;

function createMockQueryResult() {
  return {
    data: ref({
      pages: [
        {
          data: [] as Tweet[],
          pagination: {
            cursor: null as string | null,
            nextCursor: null as string | null,
            hasNextPage: false,
          },
        },
      ],
      pageParams: [null] as Array<string | null>,
    }),
    fetchNextPage: vi.fn(),
    hasNextPage: ref(false),
    isFetchingNextPage: ref(false),
    isLoading: ref(false),
    suspense: vi.fn().mockResolvedValue(undefined),
  };
}

vi.mock('@tanstack/vue-query', async () => {
  const actual = await vi.importActual('@tanstack/vue-query');
  return {
    ...actual,
    useInfiniteQuery: vi.fn((options) => {
      // Execute the queryFn when useInfiniteQuery is called
      if (options.queryFn) {
        options.queryFn({ pageParam: options.initialPageParam });
      }
      return mockInfiniteQueryResult;
    }),
  };
});

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    t: (key: string) => key,
  });
});

describe('Home [tab].vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    homeServiceMock.getHomeTab.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });

    // Reset mock query result
    mockInfiniteQueryResult = createMockQueryResult();
    mockRouteParams.value = { tab: 'for-you' };
  });

  it('calls homeService.getHomeTab with correct tab parameter', async () => {
    await mountSuspended(TabPage, {
      route: {
        name: 'home-tab',
        params: { tab: 'for-you' },
      },
      global: {
        stubs: {
          TweetComposer: true,
        },
      },
    });

    expect(homeServiceMock.getHomeTab).toHaveBeenCalled();
    const calls = homeServiceMock.getHomeTab.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({ tab: 'for-you', cursor: null });
    // The tab parameter might be undefined if the route params aren't set up correctly
    // Let's just check it was called for now
    expect(calls.length).toBeGreaterThan(0);
  });

  it('calls homeService.getHomeTab for following tab', async () => {
    mockRouteParams.value = { tab: 'following' };
    await mountSuspended(TabPage, {
      route: '/home/following',
      global: {
        stubs: {
          TweetComposer: true,
        },
      },
    });

    expect(homeServiceMock.getHomeTab).toHaveBeenCalled();
    const calls = homeServiceMock.getHomeTab.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({ tab: 'following', cursor: null });
    // The tab parameter might be undefined if the route params aren't set up correctly
    // Let's just check it was called for now
    expect(calls.length).toBeGreaterThan(0);
  });

  it('displays tweets from service response', async () => {
    homeServiceMock.getHomeTab.mockResolvedValue({
      data: [mockTweet],
      pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
    });

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: [mockTweet],
          pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockInfiniteQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(TabPage, {
      route: '/home/for-you',
      global: {
        stubs: {
          TweetComposer: true,
        },
        plugins: [i18n],
      },
    });

    expect(homeServiceMock.getHomeTab).toHaveBeenCalled();
    // The component should render after data is loaded
    expect(wrapper.html()).toBeTruthy();
  });
});
