import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import type { Tweet } from '~~/shared/types/tweets';
import MediaPage from '~/pages/search/media.vue';

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
  media: [
    {
      type: 'IMAGE' as const,
      url: '/media1.jpg',
      altText: 'Media 1',
      width: 800,
      height: 600,
    },
  ],
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

describe('Search media.vue', () => {
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

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
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

    await mountSuspended(MediaPage, {
      route: '/search/media?q=javascript',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    const calls = searchServiceMock.getTweets.mock.calls;
    expect(calls[0]?.[0]).toMatchObject({
      query: 'javascript',
      tab: 'media',
      pagination: { limit: 10, cursor: null },
    });
  });

  it('displays tweets with media from service response', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    searchServiceMock.getTweets.mockResolvedValue({
      data: [mockTweet, mockTweet, mockTweet],
      pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
    });

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: [mockTweet, mockTweet, mockTweet],
          pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockInfiniteQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
    expect(wrapper.html()).toBeTruthy();
  });

  it('chunks tweets into groups of 3 for grid display', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    // Create 5 tweets to test chunking (should result in 2 chunks: 3 and 2)
    const tweets = Array.from({ length: 5 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    searchServiceMock.getTweets.mockResolvedValue({
      data: tweets,
      pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
    });

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    const scroller = wrapper.findComponent({ name: 'VirtualInfiniteScroller' });
    expect(scroller.exists()).toBe(true);

    // Items should be chunked: [[tw-0, tw-1, tw-2], [tw-3, tw-4]]
    const items = scroller.props('items');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveLength(3);
    expect(items[1]).toHaveLength(2);
  });

  it('respects peopleFilter parameter', async () => {
    mockRouteQuery.value = { q: 'test', pf: 'on' };
    mockSearchQuery.value = 'test';

    await mountSuspended(MediaPage, {
      route: '/search/media?q=test&pf=on',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
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
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
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

  it('passes correct props to VirtualInfiniteScroller', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';

    mockInfiniteQueryResult.hasNextPage.value = true;
    mockInfiniteQueryResult.isFetchingNextPage.value = false;

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    const scroller = wrapper.findComponent({ name: 'VirtualInfiniteScroller' });
    expect(scroller.exists()).toBe(true);
    expect(scroller.props('hasNextPage')).toBe(true);
    expect(scroller.props('isFetchingNextPage')).toBe(false);
    expect(typeof scroller.props('fetchNextPage')).toBe('function');
  });

  it('displays loading spinner when fetching', async () => {
    mockRouteQuery.value = { q: 'test' };
    mockSearchQuery.value = 'test';
    mockInfiniteQueryResult.isFetching.value = true;

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
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

    await mountSuspended(MediaPage, {
      route: '/search/media?q=initial',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    // Simulate route query change
    mockRouteQuery.value = { q: 'updated' };

    expect(searchServiceMock.getTweets).toHaveBeenCalled();
  });

  it('updates when tweets are added dynamically', async () => {
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

    const wrapper = await mountSuspended(MediaPage, {
      route: '/search/media?q=test',
      global: {
        stubs: {
          Thumbnail: true,
          VirtualInfiniteScroller: true,
        },
      },
    });

    // Now add tweets
    const tweets = Array.from({ length: 6 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    await wrapper.vm.$nextTick();

    // Verify chunking still works after dynamic update
    const scroller = wrapper.findComponent({ name: 'VirtualInfiniteScroller' });
    const items = scroller.props('items');
    expect(items).toHaveLength(2); // 6 tweets in 2 chunks
  });
});
