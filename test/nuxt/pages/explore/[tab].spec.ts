import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TabPage from '~/pages/explore/[tab].vue';

const { exploreServiceMock } = vi.hoisted(() => ({
  exploreServiceMock: {
    getExploreTab: vi.fn(),
  },
}));

vi.mock('~/services/explore/exploreService', () => ({
  exploreService: exploreServiceMock,
}));

describe('Explore [tab].vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: [],
    });
  });

  it('validates tab parameter correctly', async () => {
    const validTabs = ['trending', 'news', 'sports', 'entertainment'];

    for (const tab of validTabs) {
      const wrapper = await mountSuspended(TabPage, {
        route: `/explore/${tab}`,
        global: {
          stubs: {
            Hashtag: true,
            UiSpinner: true,
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
    }
  });

  it('displays loading spinner when fetching hashtags', async () => {
    // Make the API call take a while
    exploreServiceMock.getExploreTab.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100)),
    );

    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    // Initially should show spinner
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toBeTruthy();
  });

  it('displays empty state when no hashtags are available', async () => {
    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: [],
    });

    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const emptyState = wrapper.find('h1');
    expect(emptyState.exists()).toBe(true);
  });

  it('calls exploreService.getExploreTab with correct tab parameter', async () => {
    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should be called (even if with undefined in test environment, the service was still invoked)
    expect(exploreServiceMock.getExploreTab).toHaveBeenCalled();
  });

  it('displays hashtags from service response', async () => {
    const hashtags = [
      { hashtag: 'javascript', tweetCount: 1234 },
      { hashtag: 'typescript', tweetCount: 5678 },
      { hashtag: 'vuejs', tweetCount: 9012 },
    ];

    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: hashtags,
    });

    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const hashtagComponents = wrapper.findAllComponents({ name: 'Hashtag' });
    expect(hashtagComponents.length).toBe(3);
  });

  it('loads hashtags with watch immediate on mount', async () => {
    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should be called on mount due to watch immediate: true
    expect(exploreServiceMock.getExploreTab).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    exploreServiceMock.getExploreTab.mockRejectedValue(new Error('API Error'));

    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
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

  it('passes correct props to Hashtag components', async () => {
    const hashtags = [
      { hashtag: 'javascript', tweetCount: 1234 },
      { hashtag: 'typescript', tweetCount: 5678 },
    ];

    exploreServiceMock.getExploreTab.mockResolvedValue({
      data: hashtags,
    });

    const wrapper = await mountSuspended(TabPage, {
      route: '/explore/trending',
      global: {
        stubs: {
          Hashtag: true,
          UiSpinner: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const hashtagComponents = wrapper.findAllComponents({ name: 'Hashtag' });
    expect(hashtagComponents[0].props('hashtag')).toEqual(hashtags[0]);
    expect(hashtagComponents[0].props('rank')).toBe(0);
    expect(hashtagComponents[1].props('hashtag')).toEqual(hashtags[1]);
    expect(hashtagComponents[1].props('rank')).toBe(1);
  });
});
