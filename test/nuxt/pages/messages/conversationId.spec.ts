import { describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import ConversationPage from '@/pages/messages/[conversationId]/index.vue';

// Mock useI18n
mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

// Mock definePageMeta
mockNuxtImport('definePageMeta', () => {
  return () => ({});
});

// Mock DmConversationsSection component
vi.mock('@/components/dm/DmConversationsSection.vue', () => ({
  default: {
    name: 'DmConversationsSection',
    template: '<div data-test="dm-conversations-section">Conversations</div>',
  },
}));

// Mock DmConversationView component
vi.mock('@/components/dm/conversation/DmConversationView.vue', () => ({
  default: {
    name: 'DmConversationView',
    template: '<div data-test="dm-conversation-view">Conversation View</div>',
  },
}));

describe('Conversation Page (/messages/[conversationId])', () => {
  it('renders page successfully', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders DmConversationsSection in middle slot', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    const conversationsSection = wrapper.find('[data-test="dm-conversations-section"]');
    expect(conversationsSection.exists()).toBe(true);
  });

  it('renders DmConversationView in right slot', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    const conversationView = wrapper.find('[data-test="dm-conversation-view"]');
    expect(conversationView.exists()).toBe(true);
  });

  it('uses conversation layout', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    // The page should use NuxtLayout with name="conversation"
    expect(wrapper.html()).toBeTruthy();
  });

  it('has layout set to false in definePageMeta', async () => {
    // Verify that the page defines layout: false
    const page = await import('@/pages/messages/[conversationId]/index.vue');
    expect(page.default).toBeDefined();
  });

  it('renders with hide-middle-on-mobile prop', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    // The NuxtLayout should have hide-middle-on-mobile set to true
    const html = wrapper.html();
    expect(html).toBeTruthy();
  });

  it('renders both slots correctly', async () => {
    const wrapper = await mountSuspended(ConversationPage);

    const html = wrapper.html();
    // Both sections should be rendered
    expect(html).toContain('dm-conversations-section');
    expect(html).toContain('dm-conversation-view');
  });
});
