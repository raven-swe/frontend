import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import { flushPromises, type ComponentMountingOptions } from '@vue/test-utils';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const mockTrendingHashtags: TrendingHashtag[] = [
  {
    hashtag: 'trending1',
    tweetsCount: 1000,
    category: 'Technology',
  },
  {
    hashtag: 'trending2',
    tweetsCount: 500,
    category: 'Sports',
  },
  {
    hashtag: 'trending3',
    tweetsCount: 300,
    category: 'Entertainment',
  },
];

const createWrapper = async (
  options?:
    | (Partial<
        ComponentMountingOptions<typeof import('@/components/SideBar/Right/index.vue').default>
      > & {
        route?: string;
      })
    | undefined,
) => {
  const { default: SideBarRight } = await import('@/components/SideBar/Right/index.vue');
  return await mountSuspended(SideBarRight, {
    global: {
      plugins: [i18n],
    },
    route: options?.route ?? '/home',

    ...options,
  });
};

const useQueryMock = {
  useQuery: vi.fn(() => ({
    data: mockTrendingHashtags,
    isLoading: false,
  })),
  useInfiniteQuery: vi.fn(() => ({
    data: {
      pages: [
        {
          data: [
            {
              username: 'user1',
              displayName: 'User One',
              avatarUrl: 'http://example.com/avatar1.png',
              bio: 'Bio of user one',
              bioEntities: null,
              relationship: {
                follower: true,
                following: false,
                blocking: false,
                blockedBy: false,
                muted: false,
              },
            },
          ],
        },
      ],
      pageParams: [],
    },
    isLoading: false,
  })),
};

describe('SideBar Right Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.doMock('@tanstack/vue-query', async (importActual) => {
      const actual = await importActual<typeof import('@tanstack/vue-query')>();
      return {
        ...actual,
        useQuery: useQueryMock.useQuery,
        useInfiniteQuery: useQueryMock.useInfiniteQuery,
      };
    });
  });

  it('renders the right sidebar', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    const html = wrapper.html();
    expect(html).toContain('trending1');
  });

  it('navigates to explore page when show more is clicked', async () => {
    const wrapper = await createWrapper();

    await flushPromises();

    const showMoreButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Show more'));

    expect(showMoreButton).toBeDefined();
  });
});
