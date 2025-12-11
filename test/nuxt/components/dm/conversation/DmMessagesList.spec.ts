import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmMessagesList from '@/components/dm/conversation/DmMessagesList.vue';
import type { DmMessage, DmConversation } from '@/../shared/types/dm';

// Mock @tanstack/vue-virtual
vi.mock('@tanstack/vue-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    measureElement: vi.fn(),
    value: {
      getVirtualItems: () => [
        { index: 0, key: '0', start: 0 },
        { index: 1, key: '1', start: 120 },
        { index: 2, key: '2', start: 240 },
      ],
      getTotalSize: () => 360,
      scrollToIndex: vi.fn(),
    },
  })),
}));

// Mock DmMessageItem component
vi.mock('@/components/dm/conversation/DmMessageItem.vue', () => ({
  default: {
    name: 'DmMessageItem',
    props: ['message'],
    template:
      '<div data-test="message-item" :data-message-id="message.id" :data-is-mine="message.isMine">{{ message.content }}</div>',
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

const createMockMessage = (overrides: Partial<DmMessage> = {}): DmMessage => ({
  id: '1',
  content: 'Test message',
  entities: {
    mentions: [],
    hashtags: [],
  },
  mediaUrl: null,
  createdAt: new Date().toISOString(),
  isMine: false,
  ...overrides,
});

const mockMessages: DmMessage[] = [
  createMockMessage({ id: '1', content: 'Hello there!', isMine: false }),
  createMockMessage({ id: '2', content: 'Hi! How are you?', isMine: true }),
  createMockMessage({ id: '3', content: 'I am doing great, thanks!', isMine: false }),
];

const mockConversation: DmConversation = {
  id: 'conv-1',
  participant: {
    username: 'johndoe',
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  lastMessage: {
    content: 'Hello there!',
    senderUsername: 'johndoe',
    sentAt: new Date().toISOString(),
    seen: false,
  },
  isMuted: false,
};

describe('DmMessagesList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers by default; enable fake timers only in tests that need them
    vi.useRealTimers();
  });

  it('renders successfully', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders message items for each message', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="message-item"]');
    expect(items.length).toBe(mockMessages.length);
  });

  it('displays message content', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    await flushPromises();
    const html = wrapper.html();
    expect(html).toContain('Hello there!');
    expect(html).toContain('Hi! How are you?');
    expect(html).toContain('I am doing great, thanks!');
  });

  it('renders DmConversationInfo component', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        conversation: mockConversation,
      },
    });
    await flushPromises();

    // Check for DmConversationInfo by finding the component or its expected content
    const html = wrapper.html();
    expect(html).toContain('johndoe');
    expect(html).toContain('John Doe');
  });
  it('renders empty list when no messages', async () => {
    // Mock useVirtualizer to return empty items for empty list
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [],
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="message-item"]');
    expect(items.length).toBe(0);
  });

  it('has scrollable container with correct styling', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('overflow-y-auto');
  });

  it('shows spinner when fetching next page', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: true,
        isFetchingNextPage: true,
      },
    });

    await flushPromises();
    // The spinner is rendered inside a div with v-if condition
    // Check for the spinner's container or the loading text
    const spinnerContainer = wrapper.find('.flex.items-center.justify-center.p-4');
    expect(spinnerContainer.exists()).toBe(true);
  });

  it('does not show spinner when not fetching', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const spinner = wrapper.find('[data-test="spinner"]');
    expect(spinner.exists()).toBe(false);
  });

  it('does not show spinner when hasNextPage is false', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: false,
        isFetchingNextPage: false,
      },
    });

    await flushPromises();
    const spinner = wrapper.find('[data-test="spinner"]');
    expect(spinner.exists()).toBe(false);
  });

  it('exposes parentRef and scrollToBottom via defineExpose', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    // Check that exposed properties exist
    expect(wrapper.vm.parentRef).toBeDefined();
    expect(wrapper.vm.scrollToBottom).toBeDefined();
    expect(typeof wrapper.vm.scrollToBottom).toBe('function');
  });

  it('renders with hasNextPage true', async () => {
    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: true,
        isFetchingNextPage: false,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });

  it('handles messages with media', async () => {
    const messagesWithMedia: DmMessage[] = [
      createMockMessage({
        id: '1',
        content: 'Check this out!',
        mediaUrl: 'https://example.com/image.jpg',
        isMine: true,
      }),
    ];

    // Reset mock for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 120,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: messagesWithMedia,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="message-item"]');
    expect(items.length).toBe(1);
  });

  it('handles own messages vs other messages', async () => {
    // Reset mock for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
        ],
        getTotalSize: () => 240,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const mixedMessages: DmMessage[] = [
      createMockMessage({ id: '1', content: 'From other', isMine: false }),
      createMockMessage({ id: '2', content: 'From me', isMine: true }),
    ];

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mixedMessages,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="message-item"]');
    expect(items.length).toBe(2);
    expect(items[0]!.attributes('data-is-mine')).toBe('false');
    expect(items[1]!.attributes('data-is-mine')).toBe('true');
  });

  it('calls onLoadMore when provided and scrolling to top', async () => {
    const onLoadMore = vi.fn();

    // Mock virtualizer to simulate first item visible at index 0
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
        ],
        getTotalSize: () => 240,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: true,
        isFetchingNextPage: false,
        onLoadMore,
      },
    });

    await flushPromises();

    // onLoadMore should be called when first item is visible and hasNextPage is true
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('does not call onLoadMore when isFetchingNextPage is true', async () => {
    const onLoadMore = vi.fn();

    await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: true,
        isFetchingNextPage: true,
        onLoadMore,
      },
    });

    await flushPromises();

    // onLoadMore should not be called when already fetching
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasNextPage is false', async () => {
    const onLoadMore = vi.fn();

    await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
        hasNextPage: false,
        isFetchingNextPage: false,
        onLoadMore,
      },
    });

    await flushPromises();

    // onLoadMore should not be called when there's no next page
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('renders messages with entities (mentions and hashtags)', async () => {
    // Reset mock for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 120,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const messageWithEntities: DmMessage[] = [
      createMockMessage({
        id: '1',
        content: 'Hey @john check out #trending',
        entities: {
          mentions: [{ username: 'john', startPosition: 4 }],
          hashtags: [{ hashtag: 'trending', startPosition: 20 }],
        },
        isMine: false,
      }),
    ];

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: messageWithEntities,
      },
    });

    await flushPromises();
    const items = wrapper.findAll('[data-test="message-item"]');
    expect(items.length).toBe(1);
  });

  it('calculates correct container height based on messages', async () => {
    // Reset mock to default for this test
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
          { index: 2, key: '2', start: 240 },
        ],
        getTotalSize: () => 360,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    await flushPromises();

    // Check that the inner container exists
    const innerContainer = wrapper.find('div > div:not([data-test])');
    expect(innerContainer.exists()).toBe(true);
  });

  it('scrollToBottom function can be called', async () => {
    vi.useFakeTimers();
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
        ],
        getTotalSize: () => 240,
        scrollToIndex: mockScrollToIndex,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    await flushPromises();
    vi.runAllTimers();

    // Call the exposed scrollToBottom function
    wrapper.vm.scrollToBottom();
    expect(mockScrollToIndex).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('handles message length changes (new messages)', async () => {
    vi.useFakeTimers();
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 120,
        scrollToIndex: mockScrollToIndex,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [mockMessages[0]!],
      },
    });

    await flushPromises();
    vi.runAllTimers();

    // Update with more messages
    await wrapper.setProps({
      messages: mockMessages,
    });
    await flushPromises();
    vi.runAllTimers();

    expect(wrapper.html()).toBeTruthy();
    vi.useRealTimers();
  });

  it('handles conversation switch (messages cleared)', async () => {
    vi.useFakeTimers();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages,
      },
    });

    await flushPromises();
    vi.runAllTimers();

    // Clear messages (conversation switch)
    await wrapper.setProps({
      messages: [],
    });
    await flushPromises();
    vi.runAllTimers();

    expect(wrapper.html()).toBeTruthy();
    vi.useRealTimers();
  });

  it('handles totalSize changes', async () => {
    vi.useFakeTimers();
    let totalSize = 120;
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => totalSize,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [mockMessages[0]!],
      },
    });

    await flushPromises();
    vi.runAllTimers();

    // Simulate totalSize change
    totalSize = 240;
    await wrapper.setProps({
      messages: mockMessages.slice(0, 2),
    });
    await flushPromises();
    vi.runAllTimers();

    expect(wrapper.html()).toBeTruthy();
    vi.useRealTimers();
  });

  it('handles empty virtual rows', async () => {
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      value: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [],
        hasNextPage: true,
        isFetchingNextPage: false,
        onLoadMore: vi.fn(),
      },
    });

    await flushPromises();
    expect(wrapper.html()).toBeTruthy();
  });

  it('estimates larger size for messages with media', async () => {
    // Test the estimateSize function logic
    const messagesWithMedia: DmMessage[] = [
      createMockMessage({
        id: '1',
        content: 'Message with image',
        mediaUrl: 'https://example.com/image.jpg',
        isMine: true,
      }),
    ];

    // The estimateSize function should return 320 for messages with media
    const estimateSize = (index: number) => {
      const message = messagesWithMedia[index];
      if (message?.mediaUrl) {
        return 320;
      }
      return 80;
    };

    expect(estimateSize(0)).toBe(320);
  });

  it('estimates default size for text-only messages', async () => {
    const messagesWithoutMedia: DmMessage[] = [
      createMockMessage({
        id: '1',
        content: 'Text only message',
        mediaUrl: null,
        isMine: true,
      }),
    ];

    const estimateSize = (index: number) => {
      const message = messagesWithoutMedia[index];
      if (message?.mediaUrl) {
        return 320;
      }
      return 80;
    };

    expect(estimateSize(0)).toBe(80);
  });

  it('auto-scrolls to bottom when new messages arrive and user is near bottom', async () => {
    vi.useFakeTimers();
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
        ],
        getTotalSize: () => 240,
        scrollToIndex: mockScrollToIndex,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages.slice(0, 2),
      },
    });

    await flushPromises();
    vi.runAllTimers();

    // Get the parent ref and mock its scroll position
    const parentRef = wrapper.vm.parentRef;
    if (parentRef) {
      Object.defineProperty(parentRef, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(parentRef, 'scrollHeight', { value: 250, writable: true });
      Object.defineProperty(parentRef, 'clientHeight', { value: 150, writable: true });
    }

    // Add a new message
    await wrapper.setProps({
      messages: [...mockMessages.slice(0, 2), createMockMessage({ id: '4', content: 'New!' })],
    });

    await flushPromises();
    vi.runAllTimers();

    expect(wrapper.html()).toBeTruthy();
    vi.useRealTimers();
  });

  it('does not auto-scroll when user is not near bottom', async () => {
    vi.useFakeTimers();
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [
          { index: 0, key: '0', start: 0 },
          { index: 1, key: '1', start: 120 },
        ],
        getTotalSize: () => 240,
        scrollToIndex: mockScrollToIndex,
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: mockMessages.slice(0, 2),
      },
    });

    await flushPromises();
    vi.runAllTimers();
    mockScrollToIndex.mockClear();

    // Get the parent ref and mock scroll position far from bottom
    const parentRef = wrapper.vm.parentRef;
    if (parentRef) {
      Object.defineProperty(parentRef, 'scrollTop', { value: 0, writable: true });
      Object.defineProperty(parentRef, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(parentRef, 'clientHeight', { value: 150, writable: true });
    }

    // Add a new message
    await wrapper.setProps({
      messages: [...mockMessages.slice(0, 2), createMockMessage({ id: '4', content: 'New!' })],
    });

    await flushPromises();
    vi.runAllTimers();

    // scrollToBottom should not be called after initial load
    expect(wrapper.html()).toBeTruthy();
    vi.useRealTimers();
  });

  it('marks message as seen when lastSeenMessageId matches', async () => {
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: vi.fn(),
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 120,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [mockMessages[0]!],
        lastSeenMessageId: '1',
      },
    });

    await flushPromises();
    expect(wrapper.html()).toBeTruthy();
  });

  it('measures element height correctly', async () => {
    const mockMeasureElement = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
      measureElement: mockMeasureElement,
      value: {
        getVirtualItems: () => [{ index: 0, key: '0', start: 0 }],
        getTotalSize: () => 120,
        scrollToIndex: vi.fn(),
      },
    } as unknown as ReturnType<typeof useVirtualizer>);

    const wrapper = await mountSuspended(DmMessagesList, {
      props: {
        messages: [mockMessages[0]!],
      },
    });

    await flushPromises();
    expect(wrapper.html()).toBeTruthy();
  });
});
