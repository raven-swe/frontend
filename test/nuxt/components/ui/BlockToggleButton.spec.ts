import { it, expect, describe, beforeEach, vi } from 'vitest';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import BlockToggleButton from '~/components/ui/BlockToggleButton.vue';
import type { ComponentMountingOptions } from '@vue/test-utils';
import { mountSuspended } from '@nuxt/test-utils/runtime';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const createWrapper = ({
  props,
  options,
}:
  | {
      props?: ComponentMountingOptions<typeof BlockToggleButton>['props'];
      options?: Partial<ComponentMountingOptions<typeof BlockToggleButton>>;
    }
  | undefined = {}) => {
  return mountSuspended(BlockToggleButton, {
    props,
    global: {
      plugins: [i18n],
    },
    ...options,
  });
};

describe('BlockToggleButton.vue', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders correctly when not blocked and emit block on click', async () => {
    const wrapper = await createWrapper({
      props: {
        relationship: {
          blocking: false,
        },
      },
    });
    const blockButton = wrapper.find('[data-test="block-button"]');
    expect(blockButton.exists()).toBe(true);
    await blockButton.trigger('click');
    expect(wrapper.emitted('block')).toBeTruthy();
  });

  it('renders correctly when blocked', async () => {
    const wrapper = await createWrapper({
      props: {
        relationship: {
          blocking: true,
        },
      },
    });
    const unblockButton = wrapper.find('[data-test="unblock-button"]');
    expect(unblockButton.exists()).toBe(true);
    await unblockButton.trigger('click');
    expect(wrapper.emitted('unblock')).toBeTruthy();
  });
});
