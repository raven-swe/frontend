import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders not logged in state', async () => {
    const { default: ProfilePage } = await import('~/pages/profile/index.vue');

    const wrapper = await mountSuspended(ProfilePage, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          LogoRaven: {
            template: '<div class="logo-raven"></div>',
          },
        },
      },
    });

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe("You're not logged in");

    const description = wrapper.find('p');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('Please log in to view your profile and access all features.');

    const homeLink = wrapper.find('a[href="/"]');
    expect(homeLink.exists()).toBe(true);
    expect(homeLink.text()).toBe('Take me there');
  });

  it('renders logo component', async () => {
    const { default: ProfilePage } = await import('~/pages/profile/index.vue');

    const wrapper = await mountSuspended(ProfilePage, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          LogoRaven: {
            template: '<div class="logo-raven"></div>',
          },
        },
      },
    });

    const logo = wrapper.find('.logo-raven');
    expect(logo.exists()).toBe(true);
  });
});
