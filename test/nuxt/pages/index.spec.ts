import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import IndexPage from '@/pages/index.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

describe('Auth Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(IndexPage);

    const html = wrapper.html();
    expect(html).toContain('Happening now');
    expect(html).toContain('Join today');
    expect(wrapper.find('#github-signin').exists()).toBe(true);
    expect(wrapper.find('#google-signin-btn').exists()).toBe(true);
    expect(wrapper.find('#signup').exists()).toBe(true);
    expect(wrapper.find('#signin').exists()).toBe(true);
  });
});
