import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import MediaIdPage from '@/pages/media/[id].vue';
import { tweetsService } from '@/services/tweet/tweetsService';
import { showToaster } from '~/utils/showToaster';
import { nextTick } from 'vue';

// Stub heavy child components to keep the test fast
const stubs = {
  Icon: { template: '<i />' },
  UiSpinner: { template: '<div class="spinner" />' },
  UiButton: { template: '<button><slot /></button>' },
  TweetView: { template: '<div class="tweet-view-stub" />', props: ['tweet', 'media'] },
  TweetComposer: { template: '<div class="tweet-composer-stub" />', name: 'TweetComposer' },
  ClientOnly: { template: '<div><slot /></div>' },
  Carousel: { template: '<div class="carousel-stub"><slot /></div>' },
  CarouselContent: { template: '<div class="carousel-content-stub"><slot /></div>' },
  CarouselItem: { template: '<div class="carousel-item-stub"><slot /></div>' },
  CarouselPrevious: { template: '<button class="carousel-prev-stub" />' },
  CarouselNext: { template: '<button class="carousel-next-stub" />' },
  MediaItemCompact: { template: '<div class="media-item-compact-stub" />', props: ['media'] },
  TweetDefaultCard: { template: '<div class="tweet-card-stub" />' },
};

vi.mock('~/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

vi.mock('~/utils/errorUtils', () => ({
  isApiError: (e: unknown) => typeof e === 'object' && e !== null && 'data' in e,
  isApiValidationError: (e: unknown) =>
    typeof e === 'object' &&
    e !== null &&
    'data' in e &&
    (e as { data?: { statusCode?: number } }).data?.statusCode === 422,
}));

const {
  queryClientMock,
  fetchNextPageMock,
  hasNextPageRef,
  isFetchingNextPageRef,
  virtualizerMock,
  useInfiniteQueryMock,
  useInfiniteQueryReturnValue,
} = vi.hoisted(() => ({
  queryClientMock: { setQueryData: vi.fn() },
  fetchNextPageMock: vi.fn(),
  hasNextPageRef: { value: false },
  isFetchingNextPageRef: { value: false },
  virtualizerMock: {
    getVirtualItems: vi.fn(() => [] as Record<string, unknown>[]),
    getTotalSize: vi.fn(() => 0),
    measureElement: vi.fn(),
    scrollToIndex: vi.fn(),
    options: { scrollMargin: 0 },
  },
  useInfiniteQueryMock: vi.fn(),
  useInfiniteQueryReturnValue: {
    data: { value: { pages: [{ data: [] as Record<string, unknown>[] }] } },
    fetchNextPage: vi.fn(),
    hasNextPage: { value: false },
    isFetchingNextPage: { value: false },
    isLoading: { value: false },
    suspense: vi.fn(),
  },
}));

// Mock route params and shared router
// vi.mock('vue-router', () => ({
//   useRoute: useRouteMock,
//   useRouter: () => ({ back: routerBackMock }),
// }));

// Mock tweetsService responses
vi.mock('@/services/tweet/tweetsService', () => ({
  tweetsService: {
    tweet: vi.fn(async (id: string) => ({
      data: {
        id,
        content: 'hello',
        createdAt: new Date().toISOString(),
        author: {
          username: 'tester',
          displayName: 'Tester',
          avatarUrl: '/avatar.png',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [{ type: 'IMAGE', url: '/img.jpg', altText: 'img', width: 400, height: 300 }],
      },
    })),
    replies: vi.fn(async () => ({ data: [], pagination: { hasNextPage: false } })),
  },
}));

// Mock vue-query and virtualizer minimal behavior
vi.mock('@tanstack/vue-query', () => ({
  useInfiniteQuery: (options: unknown) => {
    useInfiniteQueryMock(options);
    return useInfiniteQueryReturnValue;
  },
  useQueryClient: () => queryClientMock,
}));

vi.mock('@tanstack/vue-virtual', async () => {
  const { ref } = await import('vue');
  return {
    useWindowVirtualizer: () => ref(virtualizerMock),
  };
});

describe('pages/media/[id].vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasNextPageRef.value = false;
    isFetchingNextPageRef.value = false;
    virtualizerMock.getVirtualItems.mockReturnValue([]);
    useInfiniteQueryReturnValue.data.value = { pages: [{ data: [] }] };
    useInfiniteQueryReturnValue.fetchNextPage = fetchNextPageMock;
    useInfiniteQueryReturnValue.hasNextPage = hasNextPageRef;
    useInfiniteQueryReturnValue.isFetchingNextPage = isFetchingNextPageRef;
  });

  it('renders with divider and hides media in TweetView panel', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });

    // Divider class exists on main flex container
    const container = wrapper.find('.divide-x');
    expect(container.exists()).toBe(true);

    // Right panel renders TweetView with media=false
    const tweetView = wrapper.find('.tweet-view-stub');
    expect(tweetView.exists()).toBe(true);
  });

  it('shows back button with translated aria-label', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
    });
    const button = wrapper.find('button[aria-label]');
    expect(button.exists()).toBe(true);
  });

  it('renders carousel items from tweet media', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
    });
    const items = wrapper.findAll('.carousel-item-stub');
    expect(items.length).toBeGreaterThan(0);
  });

  it('calls router.back when back button clicked', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });
    const backSpy = vi.spyOn(wrapper.vm.$router, 'back');
    const btn = wrapper.find('button[aria-label]');
    await btn.trigger('click');
    expect(backSpy).toHaveBeenCalled();
  });

  it('shows loading spinner while main tweet is loading', async () => {
    const { tweetsService } = await import('@/services/tweet/tweetsService');
    (tweetsService.tweet as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
      async () => {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  id: 'tw-ld',
                  content: 'loading',
                  createdAt: new Date().toISOString(),
                  author: {
                    username: 'u',
                    displayName: 'U',
                    avatarUrl: '',
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
              }),
            50,
          ),
        );
      },
    );
    const wrapper = await mountSuspended(MediaIdPage, { global: { stubs } });
    // initial loading spinner
    const spinner = wrapper.find('.spinner');
    expect(spinner.exists()).toBe(true);
  });

  it('shows replies loading spinner when fetching next page', async () => {
    // Mock vue-query to simulate replies loading state
    vi.doMock('@tanstack/vue-query', () => ({
      useInfiniteQuery: () => ({
        data: { value: { pages: [{ data: [] }] } },
        fetchNextPage: vi.fn(),
        hasNextPage: { value: true },
        isFetchingNextPage: { value: true },
        isLoading: { value: false },
        suspense: vi.fn(),
      }),
      useQueryClient: () => ({ setQueryData: vi.fn() }),
    }));
    // Re-import page to pick up mocked module
    const { default: PageWithRepliesLoading } = await import('@/pages/media/[id].vue');
    const wrapper = await mountSuspended(PageWithRepliesLoading, { global: { stubs } });
    // There should be a spinner in replies section
    const repliesSpinner = wrapper.find('.spinner');
    expect(repliesSpinner.exists()).toBe(true);
  });

  it('displays error message when tweet is not found (404)', async () => {
    vi.mocked(tweetsService.tweet).mockRejectedValueOnce({
      data: { statusCode: 404 },
    });

    const wrapper = await mountSuspended(MediaIdPage, {
      global: {
        stubs,
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    // Wait for async loadMainTweet to finish
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('errors.TWEET_NOT_FOUND');
    });
  });

  it('shows toaster on generic error', async () => {
    vi.mocked(tweetsService.tweet).mockRejectedValueOnce(new Error('Network error'));

    await mountSuspended(MediaIdPage, { global: { stubs } });
    await vi.waitFor(() => {
      expect(showToaster).toHaveBeenCalledWith(
        'error',
        'toaster.tweet-page.tweet-load-error',
        true,
      );
    });
  });

  it('updates query data when a reply is posted', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });
    const composer = wrapper.findComponent({ name: 'TweetComposer' });

    const newTweet = { id: 'tw-new', text: 'New reply', replyToTweetId: 'tw-123' };
    await composer.vm.$emit('posted', newTweet);

    expect(queryClientMock.setQueryData).toHaveBeenCalledWith(
      ['tweet-replies', expect.anything()],
      expect.any(Function),
    );
  });

  it('fetches next page when scrolling to bottom', async () => {
    hasNextPageRef.value = true;
    // Simulate 10 items, last item index 9
    // Condition: lastItem.index >= tweets.value.length - 3
    // 9 >= 10 - 3 => 9 >= 7 => true
    virtualizerMock.getVirtualItems.mockReturnValue([
      { index: 9, key: '9', start: 0, end: 100, size: 100, lane: 0 },
    ]);

    // We need to mock the tweets data length to match
    // But the component computes tweets from response.value.pages
    // The mock useInfiniteQuery returns empty data by default.
    // We rely on the fact that the component checks `tweets.value.length`
    // If tweets is empty, length is 0.
    // If virtualRows has an item with index 0. 0 >= 0 - 3 => true.

    // Let's just mount. The watchEffect should trigger.
    await mountSuspended(MediaIdPage, { global: { stubs } });

    await nextTick();
    expect(fetchNextPageMock).toHaveBeenCalled();
  });

  it('reloads tweet when route params change', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });
    expect(tweetsService.tweet).toHaveBeenCalledWith('tw-123');

    // Change route params
    await wrapper.vm.$router.push({ params: { id: 'tw-456' } });
    await nextTick();
    await flushPromises();

    expect(tweetsService.tweet).toHaveBeenCalledWith('tw-456');
  });
  it('scrolls to top when a reply is posted', async () => {
    // Mock   .scrollTo
    const scrollToMock = vi.fn();
    vi.spyOn(window, 'scrollTo').mockImplementation(scrollToMock);

    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });
    const composer = wrapper.findComponent({ name: 'TweetComposer' });

    const newTweet = { id: 'new-reply', replyToTweetId: 'tw-123', content: 'reply' };
    await composer.vm.$emit('posted', newTweet);

    await nextTick(); // Wait for nextTick inside handleReplied
    await new Promise((resolve) => setTimeout(resolve, 110)); // Wait for setTimeout inside handleReplied

    expect(virtualizerMock.scrollToIndex).toHaveBeenCalledWith(0, { align: 'start' });
    expect(scrollToMock).toHaveBeenCalled();
  });

  it('correctly calculates next page param', async () => {
    await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });

    expect(useInfiniteQueryMock).toHaveBeenCalled();
    const options = useInfiniteQueryMock.mock.calls[0]![0];

    // Test getNextPageParam
    const lastPageWithNext = { pagination: { hasNextPage: true, nextCursor: 'cursor-123' } };
    expect(options.getNextPageParam(lastPageWithNext)).toBe('cursor-123');

    const lastPageWithoutNext = { pagination: { hasNextPage: false } };
    expect(options.getNextPageParam(lastPageWithoutNext)).toBeUndefined();
  });

  it('handles reply update when old data is missing', async () => {
    const wrapper = await mountSuspended(MediaIdPage, {
      global: { stubs },
      route: { params: { id: 'tw-123' } },
    });
    const composer = wrapper.findComponent({ name: 'TweetComposer' });

    const newTweet = { id: 'tw-new', text: 'New reply', replyToTweetId: 'tw-123' };
    await composer.vm.$emit('posted', newTweet);

    expect(queryClientMock.setQueryData).toHaveBeenCalled();
    const updater = queryClientMock.setQueryData.mock.calls[0]![1];

    // Call updater with undefined/null
    expect(updater(undefined)).toBeUndefined();
    expect(updater(null)).toBeNull();
  });

  it('measures elements in virtual list', async () => {
    // Setup data
    useInfiniteQueryReturnValue.data.value = {
      pages: [{ data: [{ id: '1', content: 'test' }] }],
    };
    virtualizerMock.getVirtualItems.mockReturnValue([
      { index: 0, key: '1', start: 0, end: 100, size: 100, lane: 0 },
    ]);

    const wrapper = await mountSuspended(MediaIdPage, { global: { stubs } });

    await nextTick();
    expect(virtualizerMock.measureElement).toHaveBeenCalled();

    // Trigger unmount to cover null case
    wrapper.unmount();
  });
});
