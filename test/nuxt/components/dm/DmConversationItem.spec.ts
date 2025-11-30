import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationItem from '@/components/dm/DmConversationItem.vue';
import type { DmConversation } from '@/../shared/types/dm';
import { relativeTime } from '@/utils/time';

const nowIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
const mockConversation: DmConversation = {
  id: '1',
  participant: {
    username: '@testuser',
    displayName: 'Test User',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  },
  lastMessage: {
    content: 'Hello, this is a test message',
    senderUsername: '@testuser',
    sentAt: nowIso,
  },
  isMuted: false,
};

describe('DmConversationItem Component', () => {
  it('renders conversation item with correct structure', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('gap-2');
  });

  it('displays participant avatar', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe(mockConversation.participant.avatarUrl);
    expect(avatar.classes()).toContain('rounded-full');
  });

  it('displays participant display name', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const html = wrapper.html();
    expect(html).toContain(mockConversation.participant.displayName);
  });

  it('displays participant username', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const html = wrapper.html();
    expect(html).toContain(mockConversation.participant.username);
  });

  it('displays last message content', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const html = wrapper.html();
    expect(html).toContain(mockConversation.lastMessage.content);
  });

  it('displays message sent time', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const expected = relativeTime(mockConversation.lastMessage.sentAt);
    expect(wrapper.html()).toContain(expected);
  });

  it('applies selected styling when isSelected is true', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
        isSelected: true,
      },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('border-e-primary');
  });

  it('applies transparent border when not selected', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
        isSelected: false,
      },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('border-e-transparent');
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('border-e-2');
    expect(container.classes()).toContain('p-4');
    expect(container.classes()).toContain('transition-colors');
  });
});
