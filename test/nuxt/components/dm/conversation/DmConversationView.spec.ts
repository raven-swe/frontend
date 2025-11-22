import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationView from '@/components/dm/conversation/DmConversationView.vue';

describe('DmConversationView Component', () => {
  it('renders the conversation view with correct structure', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const container = wrapper.find('div.flex.h-full.flex-col');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('overflow-hidden');
  });

  it('renders the DmConversationHeader component', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    expect(html).toContain('hussein');
  });

  it('renders the scrollable messages area', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const messagesArea = wrapper.find('.flex-1.overflow-y-auto');
    expect(messagesArea.exists()).toBe(true);
    expect(messagesArea.classes()).toContain('p-4');
  });

  it('renders DmConversationInfo component', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    // Check for info content
    expect(html).toContain('@hussein');
  });

  it('renders DmMessagesList component', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    // Check for messages content
    expect(html).toContain('Hey! How are you?');
    expect(html).toContain('Working on the project');
  });

  it('renders DmMessageInput component', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    // Check for input area
    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
  });

  it('displays multiple messages', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    expect(html).toContain('Hey! How are you?');
    expect(html).toContain('Working on the project');
    expect(html).toContain('push');
    expect(html).toContain('latest');
    expect(html).toContain('changes');
  });

  it('displays messages with mentions', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    expect(html).toContain('data-user="btngana"');
  });

  it('displays messages with hashtags', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const html = wrapper.html();
    expect(html).toContain('#update');
  });

  it('displays messages with media', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const images = wrapper.findAll('img');
    const hasMessageImage = images.some((img) => img.attributes('src')?.includes('picsum.photos'));
    expect(hasMessageImage).toBe(true);
  });

  it('has proper layout structure', async () => {
    const wrapper = await mountSuspended(DmConversationView);

    const container = wrapper.find('div.flex.h-full.flex-col');
    expect(container.exists()).toBe(true);

    const scrollArea = wrapper.find('.flex-1');
    expect(scrollArea.exists()).toBe(true);
  });
});
