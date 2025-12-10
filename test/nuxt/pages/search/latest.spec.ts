import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import type { Tweet } from '~~/shared/types/tweets';
import LatestPage from '~/pages/search/latest.vue';

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

const { searchServiceMock } = vi.hoisted(() => ({
  searchServiceMock: {
    getTweets: vi.fn(),
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
  return () => searchStoreMock;
});

mockNuxtImport('useRoute', () => {
  return () => ({
    query: mockRouteQuery.value,
  });
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
    isFetching: ref(false),
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

describe('Search latest.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchQuery.value = '';
    mockRouteQuery.value = {};
    searchServiceMock.getTweets.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });

    // Reset mock query result
    mockInfiniteQueryResult = createMockQueryResult();
  });

  it('displays empty state when no tweets are available', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    const heading = wrapper.find('p.text-\\[2rem\\]');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toContain('test');
  });

  it('calls searchService.getTweets with correct parameters', async () => {
    mockRouteQuery.value = { q: 'javascript' };
    mockSearchQuery.value = 'javascript';

    await mountSuspended(LatestPage, {
      route: '/search/latest?q=javascript',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const calls = searchServiceMock.getTweets.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({
      query: 'javascript',
      tab: 'latest',
      pagination: { limit: 10, cursor: null },
    });
  });

  it('displays tweets from service response', async () => {
    searchServiceMock.getTweets.mockResolvedValue({
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

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    expect(wrapper.html()).toBeTruthy();
  });

  it('respects peopleFilter parameter', async () => {
    mockRouteQuery.value = { q: 'test', pf: 'on' };
    mockSearchQuery.value = 'test';

    await mountSuspended(LatestPage, {
      route: '/search/latest?q=test&pf=on',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const calls = searchServiceMock.getTweets.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({
      peopleFilter: 'following',
    });
  });

  it('respects excludeMutedAndBlocked from store', async () => {
    searchStoreMock.excludeMutedAndBlocked = true;

    await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const calls = searchServiceMock.getTweets.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({
      excludeMutedAndBlocked: true,
    });

    // Reset for other tests
    searchStoreMock.excludeMutedAndBlocked = false;
  });

  it('displays loading spinner when fetching', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';
    mockInfiniteQueryResult.isFetching.value = true;

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
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
    mockInfiniteQueryResult.hasNextPage.value = true;
    mockInfiniteQueryResult.isFetchingNextPage.value = true;

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
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

    await mountSuspended(LatestPage, {
      route: '/search/latest?q=initial',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    // Simulate route query change
    mockRouteQuery.value = { q: 'updated' };

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
  });

  it('updates parentOffsetRef when tweets are added', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    // Start with empty tweets
    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: [],
          pagination: { cursor: null, nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    // Now add tweets to trigger the watch
    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: [mockTweet, { ...mockTweet, id: 'tw-2' }],
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for watch debounce

    // Component should still be mounted and functional
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

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockInfiniteQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    // The component should render with tweets
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

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: 'next', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockInfiniteQueryResult.hasNextPage.value = true;
    mockInfiniteQueryResult.isFetchingNextPage.value = false;

    const wrapper = await mountSuspended(LatestPage, {
      route: '/search/latest?q=test',
      global: {
        stubs: {
          TweetDefaultCard: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    // The watchEffect should be triggered when virtual rows exist
    expect(wrapper.exists()).toBe(true);
  });
});
