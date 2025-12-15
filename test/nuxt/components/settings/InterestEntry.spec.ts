import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import InterestEntry from '~/components/Settings/InterestEntry.vue';
import { createI18n } from 'vue-i18n';
import type { Interest } from '#shared/types/interests';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      profile: {
        'account-setup': {
          interests: {
            photography: 'Photography',
          },
        },
      },
    },
  },
});

describe('InterestEntry', () => {
  it('renders interest entry with given props', async () => {
    const interest: Interest = {
      name: 'will-not-be-used',
      code: 'photography',
      isSelected: true,
    };

    const wrapper = await mountSuspended(InterestEntry, {
      props: {
        interest,
        isActive: false,
      },
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.text()).toContain('Photography');
    const checkboxWrapper = wrapper.find('[data-test="checkbox-hover"]');
    expect(checkboxWrapper.exists()).toBe(true);
    expect(checkboxWrapper.classes()).toContain('group-hover:bg-foreground/5');
  });

  it('applies active class when isActive is true', async () => {
    const interest: Interest = {
      name: 'will-not-be-used',
      code: 'photography',
      isSelected: false,
    };

    const wrapper = await mountSuspended(InterestEntry, {
      props: {
        interest,
        isActive: true,
      },
      global: {
        plugins: [i18n],
      },
    });
    const checkboxWrapper = wrapper.find('[data-test="checkbox-hover"]');
    expect(checkboxWrapper.exists()).toBe(true);
    expect(checkboxWrapper.classes()).toContain('group-hover:bg-primary/10');
  });

  it('render fallback text when translation is missing', async () => {
    const interest: Interest = {
      name: 'Unknown Interest',
      code: 'unknown-interest',
      isSelected: false,
    };

    const wrapper = await mountSuspended(InterestEntry, {
      props: {
        interest,
        isActive: false,
      },
      global: {
        plugins: [i18n],
      },
    });
    expect(wrapper.text()).toContain('Unknown Interest');
  });

  it('emits on checkbox click', async () => {
    const interest: Interest = {
      name: 'will-not-be-used',
      code: 'photography',
      isSelected: false,
    };

    const UiCheckboxStub = {
      template: '<div @click="$emit(\'update:model-value\')"></div>',
    };

    const wrapper = await mountSuspended(InterestEntry, {
      props: {
        interest,
        isActive: false,
      },
      global: {
        plugins: [i18n],
        stubs: {
          UiCheckbox: UiCheckboxStub,
        },
      },
    });

    const checkbox = wrapper.findComponent(UiCheckboxStub);
    await checkbox.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('toggle-interest');
  });
});
