import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

mockNuxtImport('useHead', () => {
  return (options) => {
    if (options().htmlAttrs) {
      document.documentElement.setAttribute('lang', options().htmlAttrs.lang);
      document.documentElement.setAttribute('dir', options().htmlAttrs.dir);
    }
  };
});

describe('App.vue', () => {
  it('calls useHead with correct htmlAttrs', async () => {
    const { default: App } = await import('@/app.vue');
    await mountSuspended(App);

    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
