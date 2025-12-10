import { describe, it, expect } from 'vitest';

import PrivacyPage from '~/pages/settings/privacy.vue';
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
  return await mountSuspended(PrivacyPage, {
    global: {
      plugins: [i18n],
    },
  });
};

describe('pages/settings/privacy.vue', () => {
  it('renders header and description', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Privacy and safety');
    expect(wrapper.text()).toContain('Manage what information you see and share on Raven.');
  });
});
