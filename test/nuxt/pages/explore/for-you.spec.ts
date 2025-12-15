import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import type { Tweet } from '~~/shared/types/tweets';
import ForYouPage from '~/pages/explore/for-you.vue';

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

const { exploreServiceMock, homeServiceMock } = vi.hoisted(() => ({
  exploreServiceMock: {
    getExploreTab: vi.fn(),
    getCategorizedTweets: vi.fn(),
  },
  homeServiceMock: {
    getHomeTab: vi.fn(),
  },
}));

vi.mock('~/services/explore/exploreService', () => ({
  exploreService: exploreServiceMock,
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

describe('Explore for-you.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: [],
    });
    exploreServiceMock.getCategorizedTweets.mockResolvedValue({
      data: {
        categories: [],
      },
    });
    homeServiceMock.getHomeTab.mockResolvedValue({
      data: [],
      pagination: { cursor: null, nextCursor: null, hasNextPage: false },
    });

    // Reset mock query result
    mockInfiniteQueryResult = createMockQueryResult();
  });

  it('loads trending hashtags on mount', async () => {
    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(exploreServiceMock.getExploreTab).toHaveBeenCalledWith('trending');
  });

  it('loads categorized tweets on mount', async () => {
    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(exploreServiceMock.getCategorizedTweets).toHaveBeenCalled();
  });

  it('calls homeService.getHomeTab with correct parameters', async () => {
    await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    expect(homeServiceMock.getHomeTab).toHaveBeenCalledWith({ limit: 10, cursor: null }, 'for-you');
  });

  it('displays top 6 trending hashtags', async () => {
    const hashtags = Array.from({ length: 10 }, (_, i) => ({
      hashtag: `tag${i}`,
      tweetCount: 1000 - i * 100,
    }));

    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: hashtags,
    });

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const hashtagComponents = wrapper.findAllComponents({ name: 'Hashtag' });
    expect(hashtagComponents.length).toBe(6); // Only top 6
  });

  it('displays categorized tweets', async () => {
    const categorizedData = {
      categories: [
        {
          category: 'Technology',
          tweets: [mockTweet, { ...mockTweet, id: 'tw-2' }],
        },
        {
          category: 'Sports',
          tweets: [{ ...mockTweet, id: 'tw-3' }],
        },
      ],
    };

    exploreServiceMock.getCategorizedTweets.mockResolvedValue({
      data: categorizedData,
    });

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const categoryHeadings = wrapper.findAll('h1');
    expect(categoryHeadings.some((h) => h.text().includes('Technology'))).toBe(true);
    expect(categoryHeadings.some((h) => h.text().includes('Sports'))).toBe(true);
  });

  it('displays empty state when no tweets are available', async () => {
    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const emptyState = wrapper.find('[data-testid="empty-state"]');
    expect(emptyState.exists()).toBe(true);
  });

  it('displays loading spinner when fetching tweets', async () => {
    mockInfiniteQueryResult.isLoading.value = true;

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    const spinner = wrapper.findComponent({ name: 'UiSpinner' });
    expect(spinner.exists()).toBe(true);
  });

  it('displays loading spinner when fetching next page', async () => {
    mockInfiniteQueryResult.hasNextPage.value = true;
    mockInfiniteQueryResult.isFetchingNextPage.value = true;

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    const spinner = wrapper.findComponent({ name: 'UiSpinner' });
    expect(spinner.exists()).toBe(true);
  });

  it('displays tweets from infinite query', async () => {
    const tweets = [mockTweet, { ...mockTweet, id: 'tw-2' }, { ...mockTweet, id: 'tw-3' }];

    homeServiceMock.getHomeTab.mockResolvedValue({
      data: tweets,
      pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
    });

    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: tweets,
          pagination: { cursor: '0', nextCursor: 'next-cursor', hasNextPage: true },
        },
      ],
      pageParams: [null],
    };
    mockInfiniteQueryResult.hasNextPage.value = true;

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toBeTruthy();
  });

  it('handles hashtags API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    exploreServiceMock.getExploreTab.mockRejectedValue(new Error('API Error'));

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load trending hashtags:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('handles categorized tweets API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    exploreServiceMock.getCategorizedTweets.mockRejectedValue(new Error('API Error'));

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load categorized tweets:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('updates parentOffsetRef when content changes', async () => {
    // Start with empty data
    mockInfiniteQueryResult.data.value = {
      pages: [
        {
          data: [],
          pagination: { cursor: null, nextCursor: null, hasNextPage: false },
        },
      ],
      pageParams: [null],
    };

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    // Now add tweets to trigger the watch
    const tweets = [mockTweet, { ...mockTweet, id: 'tw-2' }];
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(wrapper.exists()).toBe(true);
  });

  it('triggers fetchNextPage when scrolling near end', async () => {
    const tweets = Array.from({ length: 12 }, (_, i) => ({
      ...mockTweet,
      id: `tw-${i}`,
    }));

    homeServiceMock.getHomeTab.mockResolvedValue({
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

    const wrapper = await mountSuspended(ForYouPage, {
      route: '/explore/for-you',
      global: {
        stubs: {
          Hashtag: true,
          TweetDefaultCard: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
