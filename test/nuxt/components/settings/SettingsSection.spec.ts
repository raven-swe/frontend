import { describe, expect, it } from 'vitest';
import SettingsSection from '@/components/Settings/SettingsSection/index.vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import en from '~~/i18n/locales/en.json';
import { settingSections } from '~/constants/settings-section';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

const createWrapper = async () => {
  return await mountSuspended(SettingsSection, {
    global: {
      plugins: [i18n],
    },
  });
};

describe('SettingsSection.vue', () => {
  it('renders correctly', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Settings');
    settingSections.forEach((section) => {
      const link = wrapper.find(`[data-cy="${section.cy}"]`);
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe(section.route);
      expect(link.text()).toContain(i18n.global.t(section.title));
    });
  });
});
