import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import Hashtag from '@/components/search/Hashtag.vue';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('Search Hashtag Component', () => {
  it('renders hashtag text', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#javascript' },
      global: { plugins: [i18n] },
    });
    expect(wrapper.text()).toContain('#javascript');
  });

  it('renders with correct link structure', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#vue' },
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toContain('/search/top?q=');
    expect(link.attributes('href')).toContain(encodeURIComponent('#vue'));
  });

  it('displays search icon', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#testing' },
      global: { plugins: [i18n] },
    });
    expect(wrapper.html()).toContain('ic:outline-search');
  });

  it('shows trending tab label', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#trending' },
      global: { plugins: [i18n] },
    });
    expect(wrapper.text()).toContain('Trending');
  });

  it('has hover styling classes', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#react' },
      global: { plugins: [i18n] },
    });
    const link = wrapper.find('a');
    expect(link.classes()).toContain('hover:bg-accent');
    expect(link.classes()).toContain('cursor-pointer');
  });

  it('encodes special characters in hashtag URL', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#C++' },
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe(`/search/top?q=${encodeURIComponent('#C++')}`);
  });

  it('renders hashtag with proper typography classes', async () => {
    const wrapper = await mountSuspended(Hashtag, {
      props: { hashtag: '#nuxt' },
      global: { plugins: [i18n] },
    });
    const hashtagText = wrapper.find('.font-bold');
    expect(hashtagText.exists()).toBe(true);
    expect(hashtagText.text()).toBe('#nuxt');
  });
});
