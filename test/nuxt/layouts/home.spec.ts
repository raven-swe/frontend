import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import { ref } from 'vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const accountSetupMock = vi.hoisted(() => ({ start: vi.fn(), isOpen: false }));

mockNuxtImport('useAccountSetup', () => {
  return () => ({ start: accountSetupMock.start, isOpen: ref(accountSetupMock.isOpen) });
});

vi.stubGlobal('$route', { path: '/home' });

async function mountHomeLayout() {
  const HomeLayout = (await import('@/layouts/home.vue')).default;

  return mountSuspended(HomeLayout, {
    global: {
      stubs: {
        NuxtLayout: { template: '<div><slot /></div>' },
        Tabs: { template: '<div><slot /></div>' },
        Tab: { name: 'Tab', template: '<div />' },
        TweetComposer: { template: '<div class="tweet-composer-stub" />' },
        AccountSetup: { template: '<div class="account-setup-stub" />' },
      },
      plugins: [i18n],
    },
    slots: {
      default: '<div class="slot-test">child</div>',
    },
  });
}

describe('Home layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accountSetupMock.isOpen = false;
    sessionStorage.clear();
  });

  it('renders tabs and slot content', async () => {
    const wrapper = await mountHomeLayout();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.slot-test').exists()).toBe(true);

    const tabs = wrapper.findAllComponents({ name: 'Tab' });
    expect(tabs.length).toBeGreaterThanOrEqual(2);

    expect(wrapper.find('.account-setup-stub').exists()).toBe(false);
    expect(accountSetupMock.start).not.toHaveBeenCalled();
  });

  it('starts account setup when flagged after sign-up', async () => {
    sessionStorage.setItem('showAccountSetup', 'true');

    await mountHomeLayout();

    expect(accountSetupMock.start).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('showAccountSetup')).toBeNull();
  });

  it('renders the account setup flow while it is open', async () => {
    accountSetupMock.isOpen = true;

    const wrapper = await mountHomeLayout();

    expect(wrapper.find('.account-setup-stub').exists()).toBe(true);
  });
});
