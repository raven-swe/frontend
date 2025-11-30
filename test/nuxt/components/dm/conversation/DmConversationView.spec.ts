import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import flushPromises from 'flush-promises';
import DmConversationView from '@/components/dm/conversation/DmConversationView.vue';

// Mock vue-router to provide a conversationId param
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { conversationId: '1' } }),
}));

// Mock the WebSocket composable
vi.mock('@/composables/useDmWebSocket', () => ({
  useDmWebSocket: () => ({
    isConnected: { value: false },
    isConnecting: { value: false },
    currentConversationId: { value: null },
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendMessage: vi.fn(),
    markSeen: vi.fn(),
    switchConversation: vi.fn(),
    onMessage: vi.fn(),
    onError: vi.fn(),
  }),
}));

async function mountAndResolve() {
  const wrapper = await mountSuspended(DmConversationView);
  // resolve any pending async data
  await flushPromises();
  return wrapper;
}

describe('DmConversationView Component', () => {
  it('renders the conversation view with correct structure', async () => {
    const wrapper = await mountAndResolve();

    const container = wrapper.find('div.flex.h-full.flex-col');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('overflow-hidden');
  });

  it('renders header showing conversationId fallback before data loads', async () => {
    const wrapper = await mountAndResolve();
    // Header currently shows the id "1" since participant not yet loaded in test env
    expect(wrapper.html()).toContain('>1<');
  });

  it('renders the scrollable messages area', async () => {
    const wrapper = await mountAndResolve();

    const messagesArea = wrapper.find('.flex-1.overflow-y-auto');
    expect(messagesArea.exists()).toBe(true);
    expect(messagesArea.classes()).toContain('p-4');
  });

  it('renders the messages area container', async () => {
    const wrapper = await mountAndResolve();
    const messagesArea = wrapper.find('.flex-1.overflow-y-auto.p-4');
    expect(messagesArea.exists()).toBe(true);
  });

  it('initially shows no messages list items when data not hydrated', async () => {
    const wrapper = await mountAndResolve();
    const html = wrapper.html();
    expect(html).not.toContain('Hey! How are you?');
  });

  it('renders DmMessageInput component with textarea', async () => {
    const wrapper = await mountAndResolve();
    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
  });

  it('does not display mock message content without msw hydration', async () => {
    const wrapper = await mountAndResolve();
    const html = wrapper.html();
    expect(html).not.toContain('Working on the project');
  });

  it('does not display mention attribute before messages load', async () => {
    const wrapper = await mountAndResolve();
    expect(wrapper.html()).not.toContain('data-user="btngana"');
  });

  it('does not display hashtag before messages load', async () => {
    const wrapper = await mountAndResolve();
    expect(wrapper.html()).not.toContain('#update');
  });

  it('does not display media image before messages load', async () => {
    const wrapper = await mountAndResolve();
    const images = wrapper.findAll('img');
    const hasMessageImage = images.some((img) => img.attributes('src')?.includes('picsum.photos'));
    expect(hasMessageImage).toBe(false);
  });

  it('has proper layout structure', async () => {
    const wrapper = await mountAndResolve();
    const container = wrapper.find('div.flex.h-full.flex-col');
    expect(container.exists()).toBe(true);
    const scrollArea = wrapper.find('.flex-1');
    expect(scrollArea.exists()).toBe(true);
  });
});
