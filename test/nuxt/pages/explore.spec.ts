import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ExplorePage from '@/pages/explore/index.vue';

describe('Explore Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(ExplorePage);

    const html = wrapper.html();
    expect(html).toContain('Explore');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
