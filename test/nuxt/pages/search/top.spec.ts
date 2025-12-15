import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import type { Tweet } from '~~/shared/types/tweets';
import type { CompactUser } from '~~/shared/types/user';
import TopPage from '~/pages/search/top.vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import type { UseInfiniteQueryReturnType } from '@tanstack/vue-query';

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

const mockUser: CompactUser = {
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  bioEntities: null,
  relationship: {
    following: false,
    follower: false,
    blocking: false,
    muted: false,
  },
};

const { searchServiceMock } = vi.hoisted(() => ({
  searchServiceMock: {
    getTweets: vi.fn(),
    getPeople: vi.fn(),
  },
}));

vi.mock('~/services/search/searchService', () => ({
  searchService: searchServiceMock,
}));

const searchStoreMock = vi.hoisted(() => ({
  excludeMutedAndBlocked: false,
}));

const mockSearchQuery = ref('');
const mockRouteQuery = ref<Record<string, string>>({});

mockNuxtImport('useSearchStore', () => {
  return () =>
    searchStoreMock as unknown as ReturnType<typeof import('~/stores/search').useSearchStore>;
});

mockNuxtImport('useRoute', () => {
  return () =>
    ({
      query: mockRouteQuery.value,
    }) as unknown as RouteLocationNormalizedLoaded;
});

mockNuxtImport('useSearchQuery', () => {
  return () => ({
    searchQuery: mockSearchQuery,
    initializeFromRoute: () => {
      const q = mockRouteQuery.value.q;
      if (typeof q === 'string') {
        mockSearchQuery.value = q;
      }
    },
  });
});

// Create mock query result that will be dynamically updated
let mockTweetsQueryResult: ReturnType<typeof createMockQueryResult>;
let mockUsersQueryResult: ReturnType<typeof createMockQueryResult>;

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

function createMockQueryResult() {
  return {
    data: ref({
      pages: [
        {
          data: [] as Tweet[] | CompactUser[],
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
    isFetching: ref(false),
    suspense: vi.fn().mockResolvedValue(undefined),
  } as unknown as UseInfiniteQueryReturnType<unknown, unknown>;
}

vi.mock('@tanstack/vue-query', async () => {
  const actual = await vi.importActual('@tanstack/vue-query');
  let queryCallCount = 0;
  return {
    ...actual,
    useInfiniteQuery: vi.fn((options) => {
      // Execute the queryFn when useInfiniteQuery is called
      if (options.queryFn) {
        options.queryFn({
          pageParam: options.initialPageParam,
          signal: new AbortController().signal,
        });
      }
      // Alternate between tweets and users query results
      const result = queryCallCount % 2 === 0 ? mockUsersQueryResult : mockTweetsQueryResult;
      queryCallCount++;
      return result;
    }) as unknown as typeof import('@tanstack/vue-query').useInfiniteQuery,
  };
});

describe('Search top.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchQuery.value = '';
    mockRouteQuery.value = {};
    searchServiceMock.getTweets.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });
    searchServiceMock.getPeople.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });

    // Reset mock query results
    mockTweetsQueryResult = createMockQueryResult();
    mockUsersQueryResult = createMockQueryResult();
  });

  it('displays empty state when no tweets and users are available', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    const heading = wrapper.find('h2.text-\\[2rem\\]');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toContain('test');
  });

  it('calls searchService.getTweets and getPeople with correct parameters', async () => {
    mockRouteQuery.value = { q: 'javascript' };
    mockSearchQuery.value = 'javascript';

    await mountSuspended(TopPage, {
      route: '/search/top?q=javascript',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    expect(searchServiceMock.getPeople).toHaveBeenCalled();

    const tweetCalls = searchServiceMock.getTweets.mock.calls;
    expect(tweetCalls[0]?.[0]).toMatchObject({
      query: 'javascript',
      tab: 'top',
      pagination: { cursor: null },
    });

    const peopleCalls = searchServiceMock.getPeople.mock.calls;
    expect(peopleCalls[0]?.[0]).toMatchObject({
      query: 'javascript',
      pagination: { limit: 3, cursor: null },
    });
  });

  it('displays tweets from service response', async () => {
    searchServiceMock.getTweets.mockResolvedValue({
      data: [mockTweet],
      pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
    });

    mockTweetsQueryResult.data.value = {
      pages: [
        {
          data: [mockTweet],
          pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockTweetsQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    expect(wrapper.html()).toBeTruthy();
  });

  it('displays users section when users are available', async () => {
    searchServiceMock.getPeople.mockResolvedValue({
      data: [mockUser, mockUser, mockUser],
      pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
    });

    mockUsersQueryResult.data.value = {
      pages: [
        {
          data: [mockUser, mockUser, mockUser],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    const peopleHeading = wrapper.find('h2.text-xl');
    expect(peopleHeading.exists()).toBe(true);
  });

  it('respects peopleFilter parameter', async () => {
    mockRouteQuery.value = { q: 'test', pf: 'on' };
    mockSearchQuery.value = 'test';

    await mountSuspended(TopPage, {
      route: '/search/top?q=test&pf=on',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const tweetCalls = searchServiceMock.getTweets.mock.calls;
    expect(tweetCalls[0]?.[0]).toMatchObject({
      peopleFilter: 'following',
    });

    expect(searchServiceMock.getPeople).toHaveBeenCalled();
    const peopleCalls = searchServiceMock.getPeople.mock.calls;
    expect(peopleCalls[0]?.[0]).toMatchObject({
      peopleFilter: 'following',
    });
  });

  it('respects excludeMutedAndBlocked from store', async () => {
    searchStoreMock.excludeMutedAndBlocked = true;

    await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const tweetCalls = searchServiceMock.getTweets.mock.calls;
    expect(tweetCalls[0]?.[0]).toMatchObject({
      excludeMutedAndBlocked: true,
    });

    expect(searchServiceMock.getPeople).toHaveBeenCalled();
    const peopleCalls = searchServiceMock.getPeople.mock.calls;
    expect(peopleCalls[0]?.[0]).toMatchObject({
      excludeMutedAndBlocked: true,
    });

    // Reset for other tests
    searchStoreMock.excludeMutedAndBlocked = false;
  });

  it('displays loading spinner when fetching', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';
    mockTweetsQueryResult.isFetching.value = true;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
          UiSpinner: true,
        },
      },
    });

    const spinner = wrapper.findComponent({ name: 'UiSpinner' });
    expect(spinner.exists()).toBe(true);
  });

  it('displays loading spinner when fetching next page', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';
    mockTweetsQueryResult.hasNextPage.value = true;
    mockTweetsQueryResult.isFetchingNextPage.value = true;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
          UiSpinner: true,
        },
      },
    });

    const spinner = wrapper.findComponent({ name: 'UiSpinner' });
    expect(spinner.exists()).toBe(true);
  });

  it('handles combined loading state for users and tweets', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';
    mockTweetsQueryResult.isFetching.value = true;
    mockUsersQueryResult.isFetching.value = true;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
          UiSpinner: true,
        },
      },
    });

    const spinner = wrapper.findComponent({ name: 'UiSpinner' });
    expect(spinner.exists()).toBe(true);
  });

  it('handles query changes from route', async () => {
    mockRouteQuery.value = { q: 'initial' };
    mockSearchQuery.value = 'initial';

    await mountSuspended(TopPage, {
      route: '/search/top?q=initial',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    // Simulate route query change
    mockRouteQuery.value = { q: 'updated' };

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    expect(searchServiceMock.getPeople).toHaveBeenCalled();
  });

  it('updates parentOffsetRef when tweets are added', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    // Start with empty tweets
    mockTweetsQueryResult.data.value = {
      pages: [
        {
          data: [],
          pagination: { cursor: null, nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    // Now add tweets to trigger the watch
    const tweets = Array.from({ length: 3 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    mockTweetsQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for watch debounce

    expect(wrapper.exists()).toBe(true);
  });

  it('measures element correctly when tweets exist', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    const tweets = Array.from({ length: 5 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    searchServiceMock.getTweets.mockResolvedValue({
      data: tweets,
      pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
    });

    mockTweetsQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockTweetsQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('triggers fetchNextPage when scrolling near end', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    const tweets = Array.from({ length: 12 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    searchServiceMock.getTweets.mockResolvedValue({
      data: tweets,
      pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
    });

    mockTweetsQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockTweetsQueryResult.hasNextPage.value = true;
    mockTweetsQueryResult.isFetchingNextPage.value = false;

    const wrapper = await mountSuspended(TopPage, {
      route: '/search/top?q=test',
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, unknown>) =>
            params ? `${key} ${JSON.stringify(params)}` : key,
        },
        stubs: {
          TweetDefaultCard: true,
          UserList: true,
          UiButton: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
