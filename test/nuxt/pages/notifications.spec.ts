import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import NotificationsPage from '@/pages/notifications/index.vue';

describe('Notifications Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(NotificationsPage);

    const html = wrapper.html();
    expect(html).toContain('Notifications');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
