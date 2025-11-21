import { describe, it, expect, beforeEach } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import HashtagCatchPage from '@/pages/hashtag/[...slug].vue';

// Dynamic mocks for route + i18n; we swap slug before each test.
let currentSlug: string | string[] = 'Nuxt3';

mockNuxtImport('useRoute', () => {
  return () => ({ params: { slug: currentSlug } });
});

mockNuxtImport('useI18n', () => {
  return () => ({
    // Very small t() stub that returns the key or formatted path for assertion
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'hashtag.placeholder.path') return `Path: ${params?.path}`;
      return key; // expose key so we can assert it's used
    },
  });
});

describe('Hashtag Catch-All Page [...slug].vue', () => {
  beforeEach(() => {
    currentSlug = 'Nuxt3';
  });

  it('renders single slug hashtag label and path translation', async () => {
    currentSlug = 'Nuxt3';
    const wrapper = await mountSuspended(HashtagCatchPage, { global: { stubs: { Icon: true } } });
    expect(wrapper.text()).toContain('#Nuxt3'); // tag label
    // Translation key presence (not-implemented message)
    expect(wrapper.text()).toContain('hashtag.placeholder.not-implemented');
    // Path translation output
    expect(wrapper.text()).toContain('Path: /hashtag/Nuxt3');
  });

  it('joins multi-part slug array into a single path and label', async () => {
    currentSlug = ['frontend', 'javascript'];
    const wrapper = await mountSuspended(HashtagCatchPage, { global: { stubs: { Icon: true } } });
    expect(wrapper.text()).toContain('#frontend/javascript');
    expect(wrapper.text()).toContain('Path: /hashtag/frontend/javascript');
  });

  it('includes a home navigation link with correct aria-label', async () => {
    currentSlug = 'webdev';
    const wrapper = await mountSuspended(HashtagCatchPage, { global: { stubs: { Icon: true } } });
    const homeLink = wrapper.find('a[href="/"]');
    expect(homeLink.exists()).toBe(true);
    // aria-label should be the i18n key returned (since stub t returns key)
    expect(homeLink.attributes('aria-label')).toBe('leftsidebar.nav.home');
  });

  it('handles empty slug gracefully (shows just #)', async () => {
    currentSlug = '';
    const wrapper = await mountSuspended(HashtagCatchPage, { global: { stubs: { Icon: true } } });
    // Label becomes just '#'
    expect(wrapper.text()).toContain('#');
    // Path translation still produced; trailing slash kept
    expect(wrapper.text()).toContain('Path: /hashtag/');
  });
});
