import { describe, it, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import exploreForyouPage from '~/pages/explore/for-you.vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const exploreServiceMock = vi.hoisted(() => {
  return {
    getExploreTab: vi.fn().mockResolvedValue({
      status: 'success',
      data: [
        { hashtag: '#example', tweetsCount: 1000, category: 'general' },
        { hashtag: '#example2', tweetsCount: 1001, category: 'gaming' },
        { hashtag: '#example3', tweetsCount: 1002, category: 'anime' },
      ],
    }),
  };
});

const useTweetListMock = vi.hoisted(() => {
  return {
    useCategorizedTweet: vi.fn().mockReturnValue({
      data: {
        value: {
          data: {
            categories: [
              {
                category: '#category1',
                tweets: [
                  { id: 't1', reposterId: null },
                  { id: 't2', reposterId: 'u1' },
                ],
              },
              {
                category: '#category3',
                tweets: [
                  { id: 't3', reposterId: null },
                  { id: 't4', reposterId: 'u2' },
                ],
              },
              {
                category: '#category5',
                tweets: [],
              },
            ],
          },
        },
      },
      isLoading: false,
      isError: false,
    }),
    useTimelineTweets: vi.fn().mockReturnValue({
      data: {
        value: {
          pages: [
            {
              data: [
                { id: 't5', content: 'Tweet 5' },
                { id: 't6', content: 'Tweet 6' },
              ],
            },
            {
              data: [
                { id: 't7', content: 'Tweet 7' },
                { id: 't8', content: 'Tweet 8' },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }),
  };
});

vi.mock('~/services/explore/exploreService', () => ({
  exploreService: exploreServiceMock,
}));

vi.mock('~/composables/tweet/useTweetLists', () => useTweetListMock);

const createWrapper = async () => {
  return mountSuspended(exploreForyouPage, {
    global: {
      plugins: [i18n],
    },
  });
};

describe('Explore For You Page', () => {
  it('renders categorized tweets correctly', async () => {
    const wrapper = await createWrapper();

    // Check if category titles are rendered
    expect(wrapper.text()).toContain('#example');
    expect(wrapper.text()).toContain('#example2');
    expect(wrapper.text()).toContain('#example3');

    // Check if tweets under each category are rendered
    expect(wrapper.text()).toContain('#category1');
    expect(wrapper.text()).toContain('#category3');
    expect(wrapper.text()).toContain('#category5');
  });
});
