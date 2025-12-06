import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import DmConversationView from '@/components/dm/conversation/DmConversationView.vue';
import type { DmConversation, DmMessage } from '@/../shared/types/dm';

// Mock vue-router
const mockConversationId = ref<string | null>('conv-123');
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      get conversationId() {
        return mockConversationId.value;
      },
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock composables
const mockMessages = ref<DmMessage[]>([]);
const mockMessagesLoading = ref(false);
const mockMessagesError = ref<Error | null>(null);
const mockFetchNextPage = vi.fn();
const mockHasNextPage = ref(false);
const mockIsFetchingNextPage = ref(false);

vi.mock('@/composables/useDmMessages', () => ({
  useDmMessages: () => ({
    messages: mockMessages,
    loading: mockMessagesLoading,
    error: mockMessagesError,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: mockHasNextPage,
    isFetchingNextPage: mockIsFetchingNextPage,
  }),
}));

const mockConversations = ref<DmConversation[]>([]);
const mockConversationsLoading = ref(false);
const mockConversationsError = ref<Error | null>(null);

vi.mock('@/composables/useDmConversations', () => ({
  useDmConversations: () => ({
    conversations: mockConversations,
    loading: mockConversationsLoading,
    error: mockConversationsError,
  }),
}));

const mockSocketConnect = vi.fn();
const mockSocketMarkSeen = vi.fn();
const mockSocketOnMessage = vi.fn();
const mockSocketOnError = vi.fn();
const mockSocketIsConnected = ref(true);

vi.mock('@/composables/useDmSocketIO', () => ({
  useDmSocketIO: () => ({
    connect: mockSocketConnect,
    markSeen: mockSocketMarkSeen,
    onMessage: mockSocketOnMessage,
    onError: mockSocketOnError,
    isConnected: mockSocketIsConnected,
  }),
}));

// Mock showToaster
vi.mock('@/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

// Mock child components
vi.mock('@/components/dm/conversation/DmConversationHeader.vue', () => ({
  default: {
    name: 'DmConversationHeader',
    props: ['username', 'avatarUrl'],
    template: '<div data-test="conversation-header">{{ username }}</div>',
  },
}));

vi.mock('@/components/dm/conversation/DmConversationInfo.vue', () => ({
  default: {
    name: 'DmConversationInfo',
    props: ['conversation'],
    template: '<div data-test="conversation-info"></div>',
  },
}));

vi.mock('@/components/dm/conversation/DmMessagesList.vue', () => ({
  default: {
    name: 'DmMessagesList',
    props: ['messages', 'hasNextPage', 'isFetchingNextPage', 'onLoadMore'],
    template: '<div data-test="messages-list">{{ messages.length }} messages</div>',
  },
}));

vi.mock('@/components/dm/conversation/DmMessageInput.vue', () => ({
  default: {
    name: 'DmConversationDmMessageInput',
    template: '<div data-test="message-input"></div>',
  },
}));

vi.mock('~/components/ui/Spinner.vue', () => ({
  default: {
    name: 'Spinner',
    props: ['size'],
    template: '<div data-test="spinner">Loading...</div>',
  },
}));

const createMockConversation = (overrides: Partial<DmConversation> = {}): DmConversation => ({
  id: 'conv-123',
  participant: {
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  lastMessage: {
    content: 'Hello',
    senderUsername: 'testuser',
    sentAt: new Date().toISOString(),
  },
  isMuted: false,
  ...overrides,
});

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

describe('DmConversationView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationId.value = 'conv-123';
    mockMessages.value = [];
    mockMessagesLoading.value = false;
    mockMessagesError.value = null;
    mockConversations.value = [createMockConversation()];
    mockConversationsLoading.value = false;
    mockConversationsError.value = null;
    mockSocketIsConnected.value = true;
    mockHasNextPage.value = false;
    mockIsFetchingNextPage.value = false;
  });

  it('renders successfully', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    expect(wrapper.html()).toBeTruthy();
  });

  it('renders DmConversationHeader component', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const header = wrapper.find('[data-test="conversation-header"]');
    expect(header.exists()).toBe(true);
  });

  it('renders DmConversationInfo component', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const info = wrapper.find('[data-test="conversation-info"]');
    expect(info.exists()).toBe(true);
  });

  it('renders DmMessagesList when not loading', async () => {
    mockMessagesLoading.value = false;
    mockConversationsLoading.value = false;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messagesList = wrapper.find('[data-test="messages-list"]');
    expect(messagesList.exists()).toBe(true);
  });

  it('renders message input component', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messageInput = wrapper.find('[data-test="message-input"]');
    expect(messageInput.exists()).toBe(true);
  });

  it('shows spinner when conversations are loading', async () => {
    mockConversationsLoading.value = true;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const spinner = wrapper.find('[data-test="spinner"]');
    expect(spinner.exists()).toBe(true);
  });

  it('shows spinner when messages are loading', async () => {
    mockMessagesLoading.value = true;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const spinner = wrapper.find('[data-test="spinner"]');
    expect(spinner.exists()).toBe(true);
  });

  it('does not show spinner when not loading', async () => {
    mockConversationsLoading.value = false;
    mockMessagesLoading.value = false;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const spinner = wrapper.find('[data-test="spinner"]');
    expect(spinner.exists()).toBe(false);
  });

  it('passes correct username to header from conversation', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const header = wrapper.find('[data-test="conversation-header"]');
    expect(header.text()).toContain('testuser');
  });

  it('passes conversationId as username when conversation not found', async () => {
    mockConversations.value = [];

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const header = wrapper.find('[data-test="conversation-header"]');
    expect(header.text()).toContain('conv-123');
  });

  it('connects socket when conversationId changes', async () => {
    mockSocketIsConnected.value = false;

    await mountSuspended(DmConversationView);
    await flushPromises();

    expect(mockSocketConnect).toHaveBeenCalled();
  });

  it('has correct layout structure', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const container = wrapper.find('div');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
    expect(container.classes()).toContain('h-full');
  });

  it('displays messages in the list', async () => {
    mockMessages.value = [
      createMockMessage({ id: '1', content: 'First message' }),
      createMockMessage({ id: '2', content: 'Second message' }),
    ];

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messagesList = wrapper.find('[data-test="messages-list"]');
    expect(messagesList.text()).toContain('2 messages');
  });

  it('registers onMessage callback on mount', async () => {
    await mountSuspended(DmConversationView);
    await flushPromises();

    expect(mockSocketOnMessage).toHaveBeenCalled();
  });

  it('registers onError callback on mount', async () => {
    await mountSuspended(DmConversationView);
    await flushPromises();

    expect(mockSocketOnError).toHaveBeenCalled();
  });

  it('handles null conversationId gracefully', async () => {
    mockConversationId.value = null;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    // Should still render without errors
    expect(wrapper.html()).toBeTruthy();
  });

  it('passes hasNextPage to DmMessagesList', async () => {
    mockHasNextPage.value = true;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messagesList = wrapper.findComponent({ name: 'DmMessagesList' });
    expect(messagesList.props('hasNextPage')).toBe(true);
  });

  it('passes isFetchingNextPage to DmMessagesList', async () => {
    mockIsFetchingNextPage.value = true;

    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messagesList = wrapper.findComponent({ name: 'DmMessagesList' });
    expect(messagesList.props('isFetchingNextPage')).toBe(true);
  });

  it('passes fetchNextPage as onLoadMore to DmMessagesList', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const messagesList = wrapper.findComponent({ name: 'DmMessagesList' });
    expect(messagesList.props('onLoadMore')).toBe(mockFetchNextPage);
  });

  it('renders with overflow hidden on container', async () => {
    const wrapper = await mountSuspended(DmConversationView);
    await flushPromises();

    const container = wrapper.find('div');
    expect(container.classes()).toContain('overflow-hidden');
  });
});
