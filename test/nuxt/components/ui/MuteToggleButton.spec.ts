import { it, expect, describe, beforeEach, vi } from 'vitest';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import MuteToggleButton from '~/components/ui/MuteToggleButton.vue';
import type { ComponentMountingOptions } from '@vue/test-utils';
import { mountSuspended } from '@nuxt/test-utils/runtime';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const createWrapper = ({
  props,
  options,
}:
  | {
      props?: ComponentMountingOptions<typeof MuteToggleButton>['props'];
      options?: Partial<ComponentMountingOptions<typeof MuteToggleButton>>;
    }
  | undefined = {}) => {
  return mountSuspended(MuteToggleButton, {
    props,
    global: {
      plugins: [i18n],
    },
    ...options,
  });
};

describe('MuteToggleButton.vue', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders correctly when not muted and emit mute on click', async () => {
    const wrapper = await createWrapper({
      props: {
        relationship: {
          muted: false,
        },
      },
    });
    const muteButton = wrapper.find('[data-test="mute-button"]');
    expect(muteButton.exists()).toBe(true);
    await muteButton.trigger('click');
    expect(wrapper.emitted('mute')).toBeTruthy();
  });

  it('renders correctly when muted', async () => {
    const wrapper = await createWrapper({
      props: {
        relationship: {
          muted: true,
        },
      },
    });
    const unmuteButton = wrapper.find('[data-test="unmute-button"]');
    expect(unmuteButton.exists()).toBe(true);
    await unmuteButton.trigger('click');
    expect(wrapper.emitted('unmute')).toBeTruthy();
  });
});
