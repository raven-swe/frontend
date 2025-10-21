import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileDetails from '@/components/profile/ProfileDetails.vue';

describe('ProfileDetails', () => {
  it('renders a div with a fixed height of 460px', async () => {
    const wrapper = await mountSuspended(ProfileDetails);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('div').exists()).toBe(true);
    expect(wrapper.find('div').classes()).toContain('h-[460px]');
  });
});
