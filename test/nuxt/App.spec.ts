import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import { createI18n } from 'vue-i18n';

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

const i18n = createI18n({
  locale: 'en',
  messages: { en: await import('@@/i18n/locales/en.json') },
});

describe('App.vue', () => {
  it('calls useHead with correct htmlAttrs', async () => {
    const { default: App } = await import('@/app.vue');
    await mountSuspended(App, {
      global: {
        plugins: [i18n],
      },
    });

    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
