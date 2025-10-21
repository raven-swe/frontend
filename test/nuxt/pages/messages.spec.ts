import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MessagesPage from '@/pages/messages/index.vue';

describe('Messages Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(MessagesPage);

    const html = wrapper.html();
    expect(html).toContain('Messages');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
