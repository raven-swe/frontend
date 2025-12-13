import UserHoverCard from '@/components/user/UserHoverCard.vue';
import UserMetadata from '@/components/user/UserMetadata.vue';
import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

describe('UserHoverCard Component', () => {
  it('renders metadata on hover', async () => {
    const wrapper = await mountSuspended(UserHoverCard, {
      props: { username: 'testuser' },
      slots: { default: '<div data-test="trigger">trigger</div>' },
      global: {
        plugins: [i18n],
        stubs: {
          UiHoverCardContent: {
            template: '<div data-test="hover-card-content"><slot /></div>',
          },
        },
      },
    });

    await wrapper.find('[data-test="trigger"]').trigger('mouseenter');

    const metadata = wrapper.findComponent(UserMetadata);
    expect(metadata.exists()).toBe(true);
  });
});
