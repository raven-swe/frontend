import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

// Stubs for layout and child components used by the account settings parent page
const NuxtLayoutStub = {
  props: ['name'],
  template: '<div data-testid="layout"><slot name="middle" /><slot name="right" /></div>',
};
const NuxtPageStub = { template: '<div data-testid="nuxt-page" />' };
const SettingsSectionStub = { template: '<div data-testid="settings-section" />' };

/* eslint-disable import/first */
import AccountLayoutPage from '@/pages/settings.vue';
/* eslint-enable import/first */

describe('Settings Account Layout Page', () => {
  it('renders layout with middle (settings section) and right (nuxt page) slots', async () => {
    const wrapper = await mountSuspended(AccountLayoutPage, {
      global: {
        stubs: {
          NuxtLayout: NuxtLayoutStub,
          NuxtPage: NuxtPageStub,
          settings: SettingsSectionStub,
        },
      },
    });

    // Layout wrapper rendered
    const layout = wrapper.get('[data-testid="layout"]');
    expect(layout.element).toBeDefined();

    // Middle slot content: settings section component
    const settingsSection = wrapper.get('[data-testid="settings-section"]');
    expect(settingsSection.element).toBeDefined();

    // Right slot content: child page outlet
    const nuxtPage = wrapper.get('[data-testid="nuxt-page"]');
    expect(nuxtPage.element).toBeDefined();
  });
});
