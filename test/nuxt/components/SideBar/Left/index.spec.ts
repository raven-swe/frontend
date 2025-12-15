import { describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import SideBarLeft from '@/components/SideBar/Left/index.vue';

const useI18nMock = vi.hoisted(() => {
  return {
    locale: { value: 'en-US' },
    localeProperties: { value: { dir: 'ltr' } },
    setLocale: vi.fn(),
  };
});

mockNuxtImport('useI18n', () => {
  return () => useI18nMock;
});

const useThemeMock = vi.hoisted(() => {
  return {
    mode: 'light',
    toggleTheme: vi.fn(),
  };
});

vi.mock('~/composables/useTheme', () => {
  return {
    useTheme: () => useThemeMock,
  };
});

const loginServiceMock = vi.hoisted(() => {
  return {
    logout: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('~/services/auth/loginService', () => {
  return {
    loginService: loginServiceMock,
  };
});

describe('SideBar Left Component', () => {
  it('renders the sidebar container', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    // Check if main container exists
    const container = wrapper.find('.flex.h-screen.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders the logo link', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    // Check if NuxtLink to home exists
    const logoLink = wrapper.find('a[href="/"]');
    expect(logoLink.exists()).toBe(true);
  });

  it('renders user avatar', async () => {
    const wrapper = await mountSuspended(SideBarLeft);
    await themeButton.trigger('click');
    expect(useThemeMock.toggleTheme).toHaveBeenCalled();
  });

  it('renders logout button', async () => {
    const wrapper = await mountSuspended(SideBarLeft);
    const logoutTrigger = wrapper.find('[data-cy="logout-btn-trigger"]');

    expect(logoutTrigger.exists()).toBe(true);
    await logoutTrigger.trigger('click');
    await new Promise((r) => setTimeout(r, 10));
    const logoutButton = document.querySelector('[data-cy="logout-button"]');
    expect(logoutButton).not.toBeNull();

    (logoutButton as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    const title = document.querySelector('[data-test="logout-dialog-title"]');
    expect(title?.textContent).toBe('Log out of Raven?');

    const logoutConfirmButton = document.querySelector('[data-cy="confirm-logout-button"]');
    expect(logoutConfirmButton).not.toBeNull();
    await (logoutConfirmButton as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));
    expect(loginServiceMock.logout).toHaveBeenCalled();
  });

  it('renders light mode icon when theme is light', async () => {
    useThemeMock.mode = 'light';
    const wrapper = await mountSuspended(SideBarLeft, {
      global: {
        stubs: {
          NuxtIcon: {
            template: '<div data-test="theme-icon"></div>',
          },
        },
      },
    });
    const themeIcon = wrapper.find('[data-cy="theme-switch-btn"] [data-test="theme-icon"]');
    expect(themeIcon.attributes('name')).toBe('material-symbols:nightlight');
  });

  it('renders dark mode icon when theme is dark', async () => {
    useThemeMock.mode = 'dark';
    const wrapper = await mountSuspended(SideBarLeft, {
      global: {
        stubs: {
          NuxtIcon: {
            template: '<div data-test="theme-icon"></div>',
          },
        },
      },
    });
    const themeIcon = wrapper.find('[data-cy="theme-switch-btn"] [data-test="theme-icon"]');
    expect(themeIcon.attributes('name')).toBe('material-symbols:light-mode-outline');
  });

  it('render post tweet button', async () => {
    const wrapper = await mountSuspended(SideBarLeft, {
      global: {
        stubs: {
          PostTweetDialog: {
            template: '<div data-test="post-tweet-dialog"></div>',
          },
        },
      },
    });
    const postButton = wrapper.find('[data-cy="sidebar-post-btn"]');
    expect(postButton.exists()).toBe(true);
    expect(postButton.text()).toContain('Post');

    const postDialog = wrapper.find('[data-test="post-tweet-dialog"]');
    expect(postDialog.exists()).toBe(true);
    expect(postDialog.attributes('open')).toBe('false');

    await postButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(postDialog.attributes('open')).toBe('true');
  });
});
