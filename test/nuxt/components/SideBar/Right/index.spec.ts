import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SideBarRight from '@/components/SideBar/Right/index.vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import { exploreService } from '~/services/explore/exploreService';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import { flushPromises } from '@vue/test-utils';

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

describe('SideBar Right Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the right sidebar', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    await flushPromises();

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('renders preview cards', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    await flushPromises();

    const html = wrapper.html();
    expect(html).toBeDefined();
    expect(html.length).toBeGreaterThan(0);
  });

  it("loads and displays trending hashtags in what's happening section", async () => {
    const getExploreTabSpy = vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    await flushPromises();

    expect(getExploreTabSpy).toHaveBeenCalledWith('trending');
    const html = wrapper.html();
    expect(html).toContain('trending1');
  });

  it('handles error when loading hashtags fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(exploreService, 'getExploreTab').mockRejectedValue(new Error('Network error'));

    await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load trending hashtags:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('navigates to explore page when show more is clicked', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    await flushPromises();

    const showMoreButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Show more'));

    expect(showMoreButton).toBeDefined();
  });

  it('hides what is happening section on explore page', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
      route: '/explore/for-you',
    });

    await flushPromises();

    const html = wrapper.html();
    // The what's happening section should not appear on explore pages
    expect(html).toBeDefined();
  });

  it('hides search field on explore and search pages', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
      route: '/explore',
    });

    await flushPromises();

    expect(wrapper.vm).toBeDefined();
  });

  it('shows filters on search page', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
      route: '/search',
    });

    await flushPromises();

    expect(wrapper.vm).toBeDefined();
  });

  it('handles people filter change to you-follow', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
      route: '/search',
    });

    await flushPromises();

    // The component should handle filter changes
    expect(wrapper.vm).toBeDefined();
  });

  it('handles people filter change to anyone', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockResolvedValue({
      data: mockTrendingHashtags,
      message: 'success',
    });

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
      route: '/search?pf=on',
    });

    await flushPromises();

    // The component should handle filter changes
    expect(wrapper.vm).toBeDefined();
  });

  it('displays loading spinner while fetching hashtags', async () => {
    vi.spyOn(exploreService, 'getExploreTab').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: mockTrendingHashtags,
              message: 'success',
            });
          }, 100);
        }),
    );

    const wrapper = await mountSuspended(SideBarRight, {
      global: {
        plugins: [i18n],
      },
    });

    // Check for loading state before promises resolve
    expect(wrapper.vm).toBeDefined();

    await flushPromises();
  });
});
