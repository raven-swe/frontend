import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DefaultLayout from '@/layouts/default.vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

describe('Default Layout', () => {
  it('renders the layout with three main sections', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [i18n],
      },
      slots: {
        default: '<div>Main Content</div>',
      },
    });

    expect(wrapper.html()).toContain('Main Content');
  });

  it('renders the left sidebar', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [i18n],
      },
    });

    // Check if SideBarLeft component exists
    expect(wrapper.html()).toContain('w-16');
  });

  it('renders the main content area with borders', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<div class="test-content">Test</div>',
      },
      global: {
        plugins: [i18n],
      },
    });

    // Check for main content area
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);
    expect(main.classes()).toContain('border-x');
  });

  it('renders the right sidebar in a hidden container', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [i18n],
      },
    });

    // Check for right sidebar container with hidden class
    expect(wrapper.html()).toContain('hidden');
    expect(wrapper.html()).toContain('lg:block');
  });

  it('has proper responsive layout structure', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [i18n],
      },
    });

    // Check for max-width container
    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('min-h-screen');
  });

  it('applies theme classes', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border-border');
  });
});
