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

  it('shows the settings section by default without props', async () => {
    const wrapper = await mountSuspended(SettingsLayout);
    // When no props are passed, middle section should be visible (not hidden by default)
    const middleSection = wrapper.find('[class*="flex-1"][class*="border"][class*="lg:w-[320px]"]');
    expect(middleSection.exists()).toBe(true);
  });

  it('hides middle section on mobile when hideMiddleOnMobile prop is true', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      props: {
        hideMiddleOnMobile: true,
      },
    });
    const middleSection = wrapper.find('[class*="hidden"][class*="lg:block"][class*="w-[320px]"]');
    expect(middleSection.exists()).toBe(true);
  });

  it('hides right section on mobile when hideRightOnMobile prop is true', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      props: {
        hideRightOnMobile: true,
      },
    });
    const rightSection = wrapper.find('[class*="hidden"][class*="lg:block"][class*="flex-1"]');
    expect(rightSection.exists()).toBe(true);
  });

  it('has proper responsive container structure', async () => {
    const wrapper = await mountSuspended(SettingsLayout);

    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('w-full');
  });

  it('applies theme/background classes', async () => {
    const wrapper = await mountSuspended(SettingsLayout);

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border');
  });
});
