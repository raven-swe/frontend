import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import InterestItem from '~/components/profile/account-setup/InterestItem.vue';

import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

describe('InterestItem', () => {
  it('renders interest item with correct props', async () => {
    const wrapper = await mountSuspended(InterestItem, {
      props: {
        interest: 'Photography',
        isActive: false,
      },
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.text()).toContain('Photography');
    expect(wrapper.classes()).not.toContain('bg-background');
  });

  it('applies active class when isActive is true', async () => {
    const wrapper = await mountSuspended(InterestItem, {
      props: {
        interest: 'Traveling',
        isActive: true,
      },
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.classes()).toContain('border-primary');
    expect(wrapper.classes()).toContain('bg-primary');
  });

  it('emits click event when clicked', async () => {
    const wrapper = await mountSuspended(InterestItem, {
      props: {
        interest: 'Cooking',
        isActive: false,
      },
      global: {
        plugins: [i18n],
      },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('toggleInterest');
  });
});
