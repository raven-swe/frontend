import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

vi.stubGlobal('$route', { path: '/home' });

describe('Home layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tabs and slot content', async () => {
    const HomeLayout = (await import('@/layouts/home.vue')).default;

    const wrapper = await mountSuspended(HomeLayout, {
      global: {
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
          Tabs: { template: '<div><slot /></div>' },
          Tab: { name: 'Tab', template: '<div />' },
          TweetComposer: { template: '<div class="tweet-composer-stub" />' },
        },
        plugins: [i18n],
      },
      slots: {
        default: '<div class="slot-test">child</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.slot-test').exists()).toBe(true);

    const tabs = wrapper.findAllComponents({ name: 'Tab' });
    expect(tabs.length).toBeGreaterThanOrEqual(2);
  });
});
