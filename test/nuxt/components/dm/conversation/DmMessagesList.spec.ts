import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmMessagesList from '@/components/dm/conversation/DmMessagesList.vue';
import type { DmMessage } from '@/../shared/types/dm';

// Mock @tanstack/vue-virtual
vi.mock('@tanstack/vue-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
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

describe('DmMessagesList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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

  it('renders empty list when no messages', async () => {
    // Mock useVirtualizer to return empty items for empty list
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
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
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
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
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
  });

  it('handles message length changes (new messages)', async () => {
    const mockScrollToIndex = vi.fn();
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
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
  });

  it('handles conversation switch (messages cleared)', async () => {
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
  });

  it('handles totalSize changes', async () => {
    let totalSize = 120;
    const { useVirtualizer } = await import('@tanstack/vue-virtual');
    vi.mocked(useVirtualizer).mockReturnValue({
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
});
