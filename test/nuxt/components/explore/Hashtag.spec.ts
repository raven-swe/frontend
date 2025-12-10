import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import Hashtag from '@/components/explore/Hashtag.vue';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

const mockHashtag: TrendingHashtag = {
  hashtag: '#javascript',
  category: 'Technology',
  tweetsCount: 15000,
};

describe('Explore Hashtag Component', () => {
  const globalConfig = { plugins: [i18n] };

  it('renders hashtag text', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: globalConfig,
    });
    expect(wrapper.text()).toContain('#javascript');
  });

  it('displays category and rank', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 2 },
      global: globalConfig,
    });
    expect(wrapper.text()).toContain('3 . Trending in Technology');
  });

  it('displays tweets count with compact notation', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: globalConfig,
    });
    expect(wrapper.text()).toContain('15K posts');
  });

  it('formats large tweet counts correctly', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: {
        hashtag: { hashtag: '#viral', category: 'Trending', tweetsCount: 2500000 },
        rank: 0,
      },
      global: globalConfig,
    });
    expect(wrapper.text()).toContain('2.5M posts');
  });

  it('links to search page with encoded hashtag', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: {
        ...globalConfig,
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
    expect(wrapper.find('a').attributes('href')).toBe(
      `/search/top?q=${encodeURIComponent('#javascript')}`,
    );
  });

  it('handles special characters in hashtag', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: { hashtag: '#C++', category: 'Programming', tweetsCount: 5000 }, rank: 0 },
      global: {
        ...globalConfig,
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
    expect(wrapper.find('a').attributes('href')).toBe(
      `/search/top?q=${encodeURIComponent('#C++')}`,
    );
  });

  it('scrolls to top when clicked', async () => {
    const scrollToSpy = vi.fn();
    global.window.scrollTo = scrollToSpy;
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: globalConfig,
    });
    await wrapper.trigger('click');
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('has hover styling', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: globalConfig,
    });
    const link = wrapper.find('a');
    expect(link.classes()).toContain('hover:bg-accent');
    expect(link.classes()).toContain('cursor-pointer');
  });

  it('renders with correct typography', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: mockHashtag, rank: 0 },
      global: globalConfig,
    });
    expect(wrapper.find('.font-bold').text()).toBe('#javascript');
    expect(wrapper.findAll('.text-muted-foreground').length).toBeGreaterThanOrEqual(2);
  });
});
