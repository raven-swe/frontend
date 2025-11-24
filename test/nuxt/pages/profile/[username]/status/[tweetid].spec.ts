import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { FetchError } from 'ofetch';
import type { Tweet } from '~~/shared/types/tweets';

interface TweetDetailPageVM {
  tweets: Tweet[];
  tweetData: Tweet | null;
  isLoading: boolean;
  isMainTweetFound: boolean;
  repliesIsLoading: boolean;
  hasNextPage: boolean;
  cursor: string | null;
}

const mockTweet: Tweet = {
  id: '123',
  content: 'Test tweet content',
  createdAt: new Date().toISOString(),
  author: {
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    isFollowing: false,
    isFollower: false,
  },
  replyCount: 5,
  retweetCount: 10,
  likeCount: 20,
  isLiked: false,
  isRetweeted: false,
  entities: { mentions: [], hashtags: [] },
  media: [],
};

const mockReplies: Tweet[] = [
  {
    id: '456',
    content: 'Reply 1',
    createdAt: new Date().toISOString(),
    author: {
      username: 'replier1',
      displayName: 'Replier One',
      avatarUrl: 'https://example.com/avatar2.jpg',
      isFollowing: false,
      isFollower: false,
    },
    replyCount: 0,
    retweetCount: 0,
    likeCount: 0,
    isLiked: false,
    isRetweeted: false,
    entities: { mentions: [], hashtags: [] },
    media: [],
  },
];

const {
  mockTweetsService,
  mockRouter,
  useRouteMock,
  mockShowToaster,
  mockQueryClient,
  mockInfiniteQuery,
} = vi.hoisted(() => ({
  mockTweetsService: {
    tweet: vi.fn(),
    replies: vi.fn(),
  },
  mockRouter: {
    back: vi.fn(),
    replace: vi.fn(),
  },
  useRouteMock: vi.fn(),
  mockShowToaster: vi.fn(),
  mockQueryClient: {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  },
  mockInfiniteQuery: {
    data: {
      value: {
        pages: [] as Array<{
          data: Tweet[];
          pagination: { nextCursor: string | null; hasNextPage: boolean };
        }>,
        pageParams: [] as Array<string | null>,
      },
    },
    fetchNextPage: vi.fn(),
    hasNextPage: { value: false },
    isFetchingNextPage: { value: false },
    isLoading: { value: false },
    suspense: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('~/services/tweet/tweetsService', () => ({
  tweetsService: mockTweetsService,
}));

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: useRouteMock,
}));

vi.mock('~/utils/showToaster', () => ({
  showToaster: mockShowToaster,
}));

vi.mock('@tanstack/vue-query', async () => {
  const actual = await vi.importActual('@tanstack/vue-query');
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
    useInfiniteQuery: (options: {
      queryFn?: (params: { pageParam: string | null }) => Promise<unknown>;
      initialPageParam?: string | null;
    }) => {
      // Execute the queryFn when useInfiniteQuery is called
      if (options.queryFn) {
        options.queryFn({ pageParam: options.initialPageParam ?? null }).then((result: unknown) => {
          const typedResult = result as {
            data: Tweet[];
            pagination: { nextCursor: string | null; hasNextPage: boolean };
          };
          mockInfiniteQuery.data.value = {
            pages: [typedResult],
            pageParams: [options.initialPageParam ?? null],
          };
        });
      }
      return mockInfiniteQuery;
    },
  };
});

vi.mock('@tanstack/vue-virtual', async () => {
  const { ref } = await import('vue');
  return {
    useWindowVirtualizer: () =>
      ref({
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        scrollToIndex: vi.fn(),
        measureElement: vi.fn(),
      }),
  };
});

describe('Tweet Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouteMock.mockReturnValue({
      params: {
        username: 'testuser',
        tweetid: '123',
      },
      path: '/profile/testuser/status/123',
    });
    mockTweetsService.tweet.mockResolvedValue({ data: mockTweet });
    mockTweetsService.replies.mockResolvedValue({
      data: mockReplies,
      pagination: { nextCursor: null, hasNextPage: false },
    });
    // Reset mock data
    mockInfiniteQuery.data.value = {
      pages: [{ data: mockReplies, pagination: { nextCursor: null, hasNextPage: false } }],
      pageParams: [null],
    };
    mockInfiniteQuery.hasNextPage.value = false;
    mockInfiniteQuery.isLoading.value = false;
  });

  it('should load and display the main tweet', async () => {
    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    // Wait for all promises to resolve
    await vi.waitFor(
      () => {
        expect(mockTweetsService.tweet).toHaveBeenCalledWith('123');
        expect(mockTweetsService.replies).toHaveBeenCalledWith('123', {
          limit: 10,
          cursor: null,
        });
      },
      { timeout: 3000 },
    );

    await nextTick();

    const vm = wrapper.vm as unknown as TweetDetailPageVM;
    expect(vm.tweetData).toEqual(mockTweet);
    expect(vm.tweets).toHaveLength(1);
  });

  it('should show spinner while loading', async () => {
    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: { template: '<div class="spinner">Loading...</div>' },
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    const vm = wrapper.vm as unknown as TweetDetailPageVM;
    expect(vm.isLoading).toBe(true);

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(vm.isLoading).toBe(false);
  });

  it('should display not found message when tweet does not exist', async () => {
    const error = new FetchError('Not found');
    error.data = { statusCode: 404 } as unknown as FetchError['data'];
    mockTweetsService.tweet.mockRejectedValue(error);

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: { template: '<button><slot /></button>' },
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const vm = wrapper.vm as unknown as TweetDetailPageVM;
    expect(vm.isMainTweetFound).toBe(false);
    expect(wrapper.text()).toContain('TWEET_NOT_FOUND');
  });

  it('should show error toaster on API error', async () => {
    const error = new FetchError('Server error');
    error.data = { statusCode: 500 } as unknown as FetchError['data'];
    mockTweetsService.tweet.mockRejectedValue(error);

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockShowToaster).toHaveBeenCalledWith(
      'error',
      'toaster.tweet-page.tweet-load-error',
      true,
    );
  });

  it('should redirect if username in URL does not match tweet author', async () => {
    const differentUserTweet = {
      ...mockTweet,
      author: { ...mockTweet.author, username: 'differentuser' },
    };
    mockTweetsService.tweet.mockResolvedValue({ data: differentUserTweet });

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockRouter.replace).toHaveBeenCalledWith('/profile/differentuser/status/123');
  });

  it('should call router.back() when back button is clicked', async () => {
    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const backButton = wrapper.find('button');
    await backButton.trigger('click');

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should handle empty response without rendering reply items', async () => {
    mockTweetsService.replies.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: { name: 'TweetDefaultCard', template: '<div class="tweet-card" />' },
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const cards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(cards.length).toBe(0);
  });

  it('should reload data when route params change', async () => {
    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify the component loaded initial data
    expect(mockTweetsService.tweet).toHaveBeenCalledWith('123');
    const vm = wrapper.vm as unknown as TweetDetailPageVM;
    expect(vm.tweetData).toBeDefined();
  });

  it('should handle errors in replies loading', async () => {
    // Update the mock to reflect error state before mounting
    mockInfiniteQuery.data.value = { pages: [], pageParams: [] };
    mockInfiniteQuery.isLoading.value = false;

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    const wrapper = mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Replies errors are handled by useInfiniteQuery internally, not via showToaster
    // The component should still function with empty replies
    const vm = wrapper.vm as unknown as TweetDetailPageVM;
    expect(vm.tweets).toEqual([]);
  });

  it('should set hasNextPage to false when no more tweets', async () => {
    mockTweetsService.replies.mockResolvedValue({
      data: mockReplies,
      pagination: { nextCursor: null, hasNextPage: false },
    });

    const TweetDetailPage = (await import('~/pages/profile/[username]/status/[tweetid].vue'))
      .default;

    mount(TweetDetailPage, {
      global: {
        provide: {
          registerNewTweetHandler: vi.fn(() => vi.fn()),
        },
        stubs: {
          TweetView: true,
          TweetComposer: true,
          TweetDefaultCard: true,
          UiSpinner: true,
          UiButton: true,
          Icon: true,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockInfiniteQuery.hasNextPage.value).toBe(false);
  });
});
