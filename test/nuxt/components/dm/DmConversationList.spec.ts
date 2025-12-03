import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationList from '@/components/dm/DmConversationList.vue';

const mockConversations = [
  {
    id: '1',
    participant: {
      username: 'hussein',
      displayName: 'Hussein',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    lastMessage: {
      content: 'Hey! How are you doing?',
      senderUsername: '@hussein',
      sentAt: '2h',
    },
    isMuted: false,
  },
  {
    id: '2',
    participant: {
      username: 'btngana',
      displayName: 'Ahmed Amr',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
    lastMessage: {
      content: 'Did you see the new update?',
      senderUsername: '@btngana',
      sentAt: '5h',
    },
    isMuted: false,
  },
];

describe('DmConversationList Component', () => {
  it('renders conversation list container', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });

    const container = wrapper.find('.flex.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders provided conversation items', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const html = wrapper.html();
    expect(html).toContain('Hussein');
    expect(html).toContain('Ahmed Amr');
  });

  it('renders usernames with @ prefix', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const html = wrapper.html();
    expect(html).toContain('@hussein');
    expect(html).toContain('@btngana');
  });

  it('displays last messages for each conversation', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const html = wrapper.html();
    expect(html).toContain('Hey! How are you doing?');
    expect(html).toContain('Did you see the new update?');
  });

  it('conversation items have hover styling', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const items = wrapper.findAll('.hover\\:bg-foreground\\/5');
    expect(items.length).toBe(mockConversations.length);
  });

  it('conversation items have cursor pointer styling', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const items = wrapper.findAll('.cursor-pointer');
    expect(items.length).toBe(mockConversations.length);
  });

  it('emits select event when item clicked', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const items = wrapper.findAll('.cursor-pointer');
    expect(items.length).toBeGreaterThan(0);
    await items[0]!.trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual(['1']);
  });

  it('renders the correct number of items', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: { conversations: mockConversations, selectedId: null },
    });
    const items = wrapper.findAll('.cursor-pointer');
    expect(items.length).toBe(mockConversations.length);
  });
});
