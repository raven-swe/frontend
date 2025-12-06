import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmConversationItem from '@/components/dm/DmConversationItem.vue';
import type { DmConversation } from '@/../shared/types/dm';
import { relativeTime } from '@/utils/time';

// Mock useDmHighlight composable
const mockIsHighlighted = vi.fn();
vi.mock('@/composables/useDmHighlight', () => ({
  useDmHighlight: () => ({
    isHighlighted: mockIsHighlighted,
  }),
}));

const nowIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
const mockConversation: DmConversation = {
  id: '1',
  participant: {
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  },
  lastMessage: {
    content: 'Hello, this is a test message',
    senderUsername: 'testuser',
    sentAt: nowIso,
  },
  isMuted: false,
};

describe('DmConversationItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsHighlighted.mockReturnValue(false);
  });

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

  it('displays participant username with @ prefix', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const html = wrapper.html();
    expect(html).toContain('@' + mockConversation.participant.username);
  });

  it('displays last message content', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const html = wrapper.html();
    expect(html).toContain(mockConversation.lastMessage!.content);
  });

  it('displays message sent time', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const expected = relativeTime(mockConversation.lastMessage!.sentAt);
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

  it('applies highlighted styling when conversation is highlighted', async () => {
    mockIsHighlighted.mockReturnValue(true);

    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
        isSelected: false,
      },
    });

    await flushPromises();
    const container = wrapper.find('div');
    expect(container.classes()).toContain('bg-foreground/5');
  });

  it('does not apply highlighted styling when selected even if highlighted', async () => {
    mockIsHighlighted.mockReturnValue(true);

    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
        isSelected: true,
      },
    });

    await flushPromises();
    const container = wrapper.find('div');
    // Should not have highlighted background when selected
    expect(container.classes()).not.toContain('bg-foreground/5');
  });

  it('displays "No messages yet" when lastMessage is null', async () => {
    const conversationWithoutMessage: DmConversation = {
      ...mockConversation,
      lastMessage: null,
    };

    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: conversationWithoutMessage,
      },
    });

    expect(wrapper.html()).toContain('No messages yet');
  });

  it('does not display time when lastMessage is null', async () => {
    const conversationWithoutMessage: DmConversation = {
      ...mockConversation,
      lastMessage: null,
    };

    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: conversationWithoutMessage,
      },
    });

    // The time element should not be rendered
    const timeElements = wrapper.findAll('span.flex-shrink-0');
    expect(timeElements.length).toBe(0);
  });

  it('applies highlighted text styling when highlighted', async () => {
    mockIsHighlighted.mockReturnValue(true);

    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
        isSelected: false,
      },
    });

    await flushPromises();
    const html = wrapper.html();
    expect(html).toContain('text-primary');
  });

  it('renders avatar with correct size', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const avatar = wrapper.find('img');
    expect(avatar.classes()).toContain('size-13');
  });

  it('has title attribute on display name for truncation tooltip', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const displayNameSpan = wrapper.find(
      'span[title="' + mockConversation.participant.displayName + '"]',
    );
    expect(displayNameSpan.exists()).toBe(true);
  });

  it('has title attribute on username for truncation tooltip', async () => {
    const wrapper = await mountSuspended(DmConversationItem, {
      props: {
        conversation: mockConversation,
      },
    });

    const usernameSpan = wrapper.find(
      'span[title="' + mockConversation.participant.username + '"]',
    );
    expect(usernameSpan.exists()).toBe(true);
  });
});
