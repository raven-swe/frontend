import { describe, it, expect } from 'vitest';
import MuteAndBlockPage from '~/pages/settings/mute-and-block.vue';
import { createI18n } from 'vue-i18n';
import en from '~~/i18n/locales/en.json';
import { mountSuspended } from '@nuxt/test-utils/runtime';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

const createWrapper = async () => {
  return await mountSuspended(MuteAndBlockPage, {
    global: {
      plugins: [i18n],
    },
  });
};

describe('pages/settings/mute-and-block.vue', () => {
  it('renders header and description', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Mute and block');
    expect(wrapper.text()).toContain('Manage your muted and blocked accounts.');
  });
  it('contains links to muted and blocked pages', async () => {
    const wrapper = await createWrapper();
    const mutedLink = wrapper.find('a[href="/settings/muted"]');
    const blockedLink = wrapper.find('a[href="/settings/blocked"]');
    expect(mutedLink.exists()).toBe(true);
    expect(blockedLink.exists()).toBe(true);
  });
});
