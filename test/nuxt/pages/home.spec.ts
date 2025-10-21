import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import HomePage from '@/pages/home/index.vue';

describe('Home Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(HomePage);

    const html = wrapper.html();
    expect(html).toContain('Tweets');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
