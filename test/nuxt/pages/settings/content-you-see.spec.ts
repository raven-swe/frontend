import { describe, it, expect } from 'vitest';
import MuteAndBlockPage from '~/pages/settings/content-you-see.vue';
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

describe('pages/settings/content-you-see.vue', () => {
  it('renders header and description', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Content you see');
    expect(wrapper.text()).toContain('Decide what you see on Raven based on your Interests');
  });
  it('contains links to interests page', async () => {
    const wrapper = await createWrapper();
    const interestsLink = wrapper.find('a[href="/settings/interests"]');
    expect(interestsLink.exists()).toBe(true);
  });
});
