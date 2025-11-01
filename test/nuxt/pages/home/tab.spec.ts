import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock('~/api', () => ({
  apiFetch: apiFetchMock,
}));

vi.stubGlobal('definePageMeta', () => {});
vi.stubGlobal('$t', (k: string) => k);

// default mock for route
const useRouteMock = vi.fn(() => ({
  params: { tab: 'for-you' },
}));

vi.mock('vue-router', () => ({
  useRoute: useRouteMock,
}));

vi.mock('@vueuse/core', () => {
  return {
    useInfiniteScroll: () => {},
    useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
  };
});

describe('Home [tab].vue (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouteMock.mockReturnValue({ params: { tab: 'for-you' } });
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

    apiFetchMock.mockResolvedValue({
      data: {
        data: [mockTweet],
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();

    const cards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty response (no new tweets) without rendering items', async () => {
    apiFetchMock.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();

    const cards = wrapper.findAllComponents({ name: 'TweetDefaultCard' });
    expect(cards.length).toBe(0);
  });

  it('logs error and resets loading when fetch fails', async () => {
    const error = new Error('network');
    apiFetchMock.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    const wrapper = mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    expect(wrapper.find('.text-muted-foreground').exists()).toBe(false);

    consoleSpy.mockRestore();
  });

  it('invokes the infinite-scroll handler provided to useInfiniteScroll', async () => {
    vi.doMock('@vueuse/core', () => {
      return {
        useInfiniteScroll: (_el: unknown, cb: () => unknown) => {
          void cb();
        },
        useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
      };
    });

    apiFetchMock.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    mount(HomePage, {
      global: {
        stubs: { TweetDefaultCard: true },
        mocks: { $t: (k: string) => k },
      },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();
  });

  it('executes canLoadMore option from useInfiniteScroll', async () => {
    vi.doMock('@vueuse/core', () => {
      return {
        useInfiniteScroll: (
          _el: unknown,
          cb: () => unknown,
          options: { canLoadMore?: () => boolean } | undefined,
        ) => {
          if (options?.canLoadMore) options.canLoadMore();
          void cb();
        },
        useVirtualList: (list: unknown) => ({ list, containerProps: {}, wrapperProps: {} }),
      };
    });

    apiFetchMock.mockResolvedValue({
      data: { data: [], pagination: { cursor: null, nextCursor: null, hasNextPage: false } },
    });

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    mount(HomePage, {
      global: { stubs: { TweetDefaultCard: true }, mocks: { $t: (k: string) => k } },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();
  });

  it('fetches from homeService.following when tab param = following', async () => {
    useRouteMock.mockReturnValue({ params: { tab: 'following' } });
    apiFetchMock.mockResolvedValue({
      data: {
        data: [],
        pagination: { cursor: null, nextCursor: null, hasNextPage: false },
      },
    });

    const HomePage = (await import('@/pages/home/[tab].vue')).default;

    mount(HomePage, {
      global: { stubs: { TweetDefaultCard: true }, mocks: { $t: (k: string) => k } },
    });

    await nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(apiFetchMock).toHaveBeenCalled();
  });
});
