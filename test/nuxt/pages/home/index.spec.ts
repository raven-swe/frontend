import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock);
vi.stubGlobal('definePageMeta', () => {});
vi.stubGlobal('$t', (k: string) => k);

vi.mock('@vueuse/core', () => {
  return {
    useInfiniteScroll: () => {},
    useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
  };
});

describe('Home page (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tweets and renders TweetDefaultCard items', async () => {
    const mockTweet = {
      id: 'tw-1',
      author: { username: 'u1', displayName: 'U One', avatarUrl: '' },
      content: 'hello',
      createdAt: new Date().toISOString(),
      replyCount: 0,
      retweetCount: 0,
      likeCount: 0,
      isLiked: false,
      isRetweeted: false,
      entities: { mentions: [], hashtags: [] },
      media: [],
    };

    fetchMock.mockResolvedValue({
      data: {
        data: [mockTweet],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });

    const HomePage = (await import('@/pages/home/index.vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalled();

    const cards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty response (no new tweets) without rendering items', async () => {
    fetchMock.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/index.vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalled();

    const cards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(cards.length).toBe(0);
  });

  it('logs error and resets loading when fetch fails', async () => {
    const error = new Error('network');
    fetchMock.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const HomePage = (await import('@/pages/home/index.vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    expect(wrapper.find('.text-muted-foreground').exists()).toBe(false);

    consoleSpy.mockRestore();
  });

  it('invokes the infinite-scroll handler provided to useInfiniteScroll', async () => {
    vi.resetModules();

    const fetchMock2 = vi.fn();
    vi.stubGlobal('$fetch', fetchMock2);
    vi.stubGlobal('definePageMeta', () => {});
    vi.stubGlobal('$t', (k: string) => k);

    vi.mock('@vueuse/core', () => {
      return {
        useInfiniteScroll: (_el: unknown, cb: () => unknown) => {
          void cb();
        },
        useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
      };
    });

    fetchMock2.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/index.vue')).default;

    mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock2).toHaveBeenCalled();
  });

  it('executes canLoadMore option from useInfiniteScroll to cover reactive check', async () => {
    vi.resetModules();

    const fetchMock3 = vi.fn();
    vi.stubGlobal('$fetch', fetchMock3);
    vi.stubGlobal('definePageMeta', () => {});
    vi.stubGlobal('$t', (k: string) => k);

    vi.mock('@vueuse/core', () => {
      return {
        useInfiniteScroll: (
          _el: unknown,
          cb: () => unknown,
          options: { canLoadMore?: () => boolean } | undefined,
        ) => {
          // Invoke canLoadMore to evaluate `hasNextPage.value && !isLoading.value`
          if (options?.canLoadMore) options.canLoadMore();
          void cb();
        },
        useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
      };
    });

    fetchMock3.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/index.vue')).default;

    mount(HomePage, {
      global: { stubs: { TweetDefaultCard: true }, mocks: { $t: (k: string) => k } },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchMock3).toHaveBeenCalled();
  });
});
