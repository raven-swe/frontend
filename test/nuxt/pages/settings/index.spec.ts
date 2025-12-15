import { describe, it, expect, vi } from 'vitest';
import SettingsPage from '~/pages/settings/index.vue';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

describe('settings page', () => {
  it('callls navigateTo settings/account', async () => {
    await mountSuspended(SettingsPage, {
      global: {
        plugins: [i18n],
      },
    });
    expect(navigateToMock).toHaveBeenCalledWith('/settings/account');
  });
});
