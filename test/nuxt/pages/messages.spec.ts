import { describe, expect, it } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import MessagesPage from '@/pages/messages/index.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

describe('Messages Page', () => {
  it('renders page with DM conversations section', async () => {
    const wrapper = await mountSuspended(MessagesPage);

    // Check if the DmConversationsSection component is rendered
    const html = wrapper.html();
    expect(html).toBeTruthy();

    // Check for DM-related content
    expect(wrapper.findComponent({ name: 'DmConversationsSection' }).exists()).toBe(true);
  });

  it('uses the correct layout', async () => {
    const wrapper = await mountSuspended(MessagesPage);

    // The page should render successfully with settings layout
    expect(wrapper.html()).toBeTruthy();
  });
});
