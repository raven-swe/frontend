import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Stub globals and modules before importing the SFC
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
    expect(cards.length).toBe(1);
  });
});
