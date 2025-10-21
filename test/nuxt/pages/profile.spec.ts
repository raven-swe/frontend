import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfilePage from '@/pages/profile/index.vue';

describe('Profile Page', () => {
  it('renders page with correct structure', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    // Check main container exists
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('renders posts', async () => {
    const wrapper = await mountSuspended(ProfilePage);

    const html = wrapper.html();
    // Check if posts are rendered
    expect(html).toContain('Post 1');
    expect(html).toContain('Post 2');
    expect(html).toContain('Post 3');
  });
});
