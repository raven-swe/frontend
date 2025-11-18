import { describe, expect, it } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import SettingsLayout from '@/layouts/settings.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

describe('Settings Layout', () => {
  it('renders middle and right slot content', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      slots: {
        middle: '<div >Middle Content</div>',
        right: '<div >Right Content</div>',
      },
    });

    expect(wrapper.html()).toContain('Middle Content');
    expect(wrapper.html()).toContain('Right Content');
    const rightSection = wrapper.find('div.flex-1.border');
    expect(rightSection.exists()).toBe(true);
  });

  it('renders the left sidebar container', async () => {
    const wrapper = await mountSuspended(SettingsLayout);
    expect(wrapper.html()).toContain('w-16');
    expect(wrapper.html()).toContain('sticky');
    expect(wrapper.html()).toContain('top-0');
  });

  it('shows the settings section only on large screens', async () => {
    const wrapper = await mountSuspended(SettingsLayout);
    const settingsSection = wrapper.find('[class*="hidden"][class*="lg:block"][class*="border"]');
    expect(settingsSection.exists()).toBe(true);
  });

  it('has proper responsive container structure', async () => {
    const wrapper = await mountSuspended(SettingsLayout);

    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('min-h-screen');
  });

  it('applies theme/background classes', async () => {
    const wrapper = await mountSuspended(SettingsLayout);

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border');
  });
});
