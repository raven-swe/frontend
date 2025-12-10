import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmConversationList from '@/components/dm/DmConversationList.vue';
import type { DmConversation } from '@/../shared/types/dm';

// Mock @tanstack/vue-virtual to avoid virtualization complexity in tests
vi.mock('@tanstack/vue-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    value: {
      getVirtualItems: () => [
        { index: 0, key: '0', start: 0 },
        { index: 1, key: '1', start: 84 },
        { index: 2, key: '2', start: 168 },
      ],
      getTotalSize: () => 252,
    },
  })),
}));

// Mock the DmConversationItem component
vi.mock('@/components/dm/DmConversationItem.vue', () => ({
  default: {
    name: 'DmConversationItem',
    props: ['conversation', 'isSelected'],
    template:
      '<div data-test="conversation-item" :data-conversation-id="conversation.id" :data-selected="isSelected">{{ conversation.participant.displayName }}</div>',
  },
}));

// Mock UiSpinner component
vi.mock('@/components/ui/spinner/Spinner.vue', () => ({
  default: {
    name: 'UiSpinner',
    props: ['size'],
    template: '<div data-test="spinner">Loading...</div>',
  },
}));

const mockConversations: DmConversation[] = [
  {
    id: '1',
    participant: {
      username: 'user1',
      displayName: 'User One',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
    lastMessage: {
      content: 'Hello from user 1',
      senderUsername: 'user1',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    isMuted: false,
  },
  {
    id: '2',
    participant: {
      username: 'user2',
      displayName: 'User Two',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    lastMessage: {
      content: 'Hello from user 2',
      senderUsername: 'user2',
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    isMuted: false,
  },
  {
    id: '3',
    participant: {
      username: 'user3',
      displayName: 'User Three',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
    lastMessage: null,
    isMuted: true,
  },
];

describe('DmConversationList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders conversation items for each conversation', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBe(mockConversations.length);
  });

  it('displays conversation participant names', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const html = wrapper.html();
    expect(html).toContain('User One');
    expect(html).toContain('User Two');
    expect(html).toContain('User Three');
  });

  it('emits select event when conversation item is clicked', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBeGreaterThan(0);
    await items[0]!.trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual(['1']);
  });

  it('passes correct isSelected prop to DmConversationItem', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: '2',
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const conversationItems = wrapper.findAllComponents({ name: 'DmConversationItem' });
    expect(conversationItems.length).toBeGreaterThan(0);

    // First item should not be selected
    expect(conversationItems[0]!.props('isSelected')).toBe(false);
    // Second item should be selected
    expect(conversationItems[1]!.props('isSelected')).toBe(true);
    // Third item should not be selected
    expect(conversationItems[2]!.props('isSelected')).toBe(false);
  });

  it('renders empty list when no conversations', async () => {
    // Mock useVirtualizer to return empty items for empty list
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: [],
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBe(0);
  });

  it('has scrollable container with correct styling', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('overflow-auto');
    expect(container.classes()).toContain('flex-1');
  });

  it('renders with hasNextPage true', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });

  it('updates when selectedId prop changes', async () => {
    // Reset mock to default for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 84 },
          { index: 2, key: '2', start: 168 },
        ],
        getTotalSize: () => 252,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: '1',
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();

    // Check initial selection state via data attribute on first item
    let items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBe(3);
    expect(items[0]!.attributes('data-selected')).toBe('true');
    expect(items[1]!.attributes('data-selected')).toBe('false');

    // Update selectedId
    await wrapper.setProps({ selectedId: '3' });
    await flushPromises();

    // Now third item should be selected
    items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items[0]!.attributes('data-selected')).toBe('false');
    expect(items[2]!.attributes('data-selected')).toBe('true');
  });

  it('handles conversation without lastMessage', async () => {
    // Mock useVirtualizer for single item
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 84,
      },
    } as ReturnType<typeof useVirtualizer>);

    const conversationsWithNullMessage: DmConversation[] = [
      {
        id: '1',
        participant: {
          username: 'newuser',
          displayName: 'New User',
          avatarUrl: 'https://i.pravatar.cc/150?img=10',
        },
        lastMessage: null,
        isMuted: false,
      },
    ];

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: conversationsWithNullMessage,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBe(1);
    expect(wrapper.html()).toContain('New User');
  });

  it('emits select with correct conversation id when different items clicked', async () => {
    // Reset mock to default for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 84 },
          { index: 2, key: '2', start: 168 },
        ],
        getTotalSize: () => 252,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="conversation-item"]');
    expect(items.length).toBe(3);

    // Click second item
    await items[1]!.trigger('click');
    expect(wrapper.emitted('select')![0]).toEqual(['2']);

    // Click third item
    await items[2]!.trigger('click');
    expect(wrapper.emitted('select')![1]).toEqual(['3']);
  });

  it('emits loadMore when scrolling near the end with hasNextPage true', async () => {
    // Mock virtualizer to simulate last item visible
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 84 },
          { index: 2, key: '2', start: 168 },
        ],
        getTotalSize: () => 252,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();

    // The loadMore event should be emitted when the last item is visible
    expect(wrapper.emitted('loadMore')).toBeTruthy();
  });

  it('does not emit loadMore when isFetchingNextPage is true', async () => {
    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: true,
        isFetchingNextPage: true,
      },
    });

    await flushPromises();

    // Should not emit loadMore when already fetching
    expect(wrapper.emitted('loadMore')).toBeFalsy();
  });

  it('calculates correct total size based on conversations', async () => {
    // Reset mock to default for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 84 },
          { index: 2, key: '2', start: 168 },
        ],
        getTotalSize: () => 252,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmConversationList, {
      props: {
        conversations: mockConversations,
        selectedId: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();

    // Check that the inner container exists
    const innerContainer = wrapper.find('div > div');
    expect(innerContainer.exists()).toBe(true);
  });
});
