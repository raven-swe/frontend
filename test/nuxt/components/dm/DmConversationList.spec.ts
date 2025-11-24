import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationList from '@/components/dm/DmConversationList.vue';

describe('DmConversationList Component', () => {
  it('renders conversation list container', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const container = wrapper.find('.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders multiple conversation items', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const html = wrapper.html();
    // Check for usernames from the mock data
    expect(html).toContain('@hussein');
    expect(html).toContain('@btngana');
    expect(html).toContain('@farag');
    expect(html).toContain('@mostafa');
    expect(html).toContain('@habiba');
  });

  it('renders conversation items with correct display names', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const html = wrapper.html();
    expect(html).toContain('Hussein');
    expect(html).toContain('Ahmed Amr');
    expect(html).toContain('Abdullah Farag');
    expect(html).toContain('Mostafa Hassan');
    expect(html).toContain('Habiba Ayman');
  });

  it('displays last messages for conversations', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const html = wrapper.html();
    expect(html).toContain('Hey! How are you doing?');
    expect(html).toContain('Did you see the new update?');
    expect(html).toContain('Thanks for your help yesterday!');
  });

  it('conversation items have hover styling', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const items = wrapper.findAll('.hover\\:bg-foreground\\/5');
    expect(items.length).toBeGreaterThan(0);
  });

  it('conversation items have cursor pointer styling', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const items = wrapper.findAll('.cursor-pointer');
    expect(items.length).toBeGreaterThan(0);
  });

  it('can select a conversation item on click', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const items = wrapper.findAll('.cursor-pointer');
    if (items.length > 0 && items[0]) {
      await items[0].trigger('click');

      // After click, the item should have selected styling
      const html = wrapper.html();
      expect(html).toContain('border-e-primary');
    }
  });

  it('renders at least 5 conversation items', async () => {
    const wrapper = await mountSuspended(DmConversationList);

    const items = wrapper.findAll('.cursor-pointer');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });
});
