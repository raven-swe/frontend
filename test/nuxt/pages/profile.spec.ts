import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfilePage from '@/pages/profile/index.vue';

describe('Profile Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    const html = wrapper.html();
    expect(html).toContain('Profile');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
