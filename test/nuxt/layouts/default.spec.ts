import { describe, expect, it } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import DefaultLayout from '@/layouts/default.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

describe('Default Layout', () => {
  it('renders the layout with three main sections', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<div>Main Content</div>',
      },
    });

    expect(wrapper.html()).toContain('Main Content');
  });

  it('renders the left sidebar', async () => {
    const wrapper = await mountSuspended(DefaultLayout);

    // Check if SideBarLeft component exists
    expect(wrapper.html()).toContain('w-16');
  });

  it('renders the main content area with borders', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<div class="test-content">Test</div>',
      },
    });

    // Check for main content area
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);
    expect(main.classes()).toContain('border-x');
  });

  it('renders the right sidebar in a hidden container', async () => {
    const wrapper = await mountSuspended(DefaultLayout);

    // Check for right sidebar container with hidden class
    expect(wrapper.html()).toContain('hidden');
    expect(wrapper.html()).toContain('lg:block');
  });

  it('has proper responsive layout structure', async () => {
    const wrapper = await mountSuspended(DefaultLayout);

    // Check for max-width container
    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('min-h-screen');
  });

  it('applies theme classes', async () => {
    const wrapper = await mountSuspended(DefaultLayout);

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border-border');
  });
});
