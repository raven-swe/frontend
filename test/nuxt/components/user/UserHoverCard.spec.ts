import UserHoverCard from '@/components/user/UserHoverCard.vue';
import UserMetadata from '@/components/user/UserMetadata.vue';
import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

describe('UserHoverCard Component', () => {
  it('forwards follow/unfollow/unblock events', async () => {
    const wrapper = await mountSuspended(UserHoverCard, {
      props: { username: 'testuser' },
      slots: { default: '<div data-test="trigger">trigger</div>' },
      global: {
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

    metadata.vm.$emit('follow');
    metadata.vm.$emit('unfollow');
    metadata.vm.$emit('unblock');

    expect(wrapper.emitted().follow).toBeTruthy();
    expect(wrapper.emitted().unfollow).toBeTruthy();
    expect(wrapper.emitted().unblock).toBeTruthy();
  });
});
