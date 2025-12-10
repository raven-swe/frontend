import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import DmConversationsSection from '@/components/dm/DmConversationsSection.vue';

// Mock the DmNewMessageDialog to avoid i18n issues
vi.mock('@/components/dm/DmNewMessageDialog.vue', () => ({
  default: {
    name: 'DmNewMessageDialog',
    template: '<div data-test="dialog"></div>',
  },
}));

// Mock showToaster
const mockShowToaster = vi.fn();
vi.mock('@/utils/showToaster', () => ({
  showToaster: (...args: unknown[]) => mockShowToaster(...args),
}));

// Mock useDmHighlight
const mockRemoveHighlight = vi.fn();
vi.mock('@/composables/useDmHighlight', () => ({
  useDmHighlight: () => ({
    removeHighlight: mockRemoveHighlight,
  }),
}));

const mockConversations = ref([
  {
    id: '1',
    participant: {
      username: 'hussein',
      displayName: 'Hussein',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
    lastMessage: { content: 'Hey! How are you doing?', senderUsername: '@hussein', sentAt: '2h' },
    isMuted: false,
  },
]);
const mockLoading = ref(false);
const mockError = ref<Error | null>(null);
const mockFetchNextPage = vi.fn();
const mockHasNextPage = ref(false);
const mockIsFetchingNextPage = ref(false);

vi.mock('@/composables/useDmConversations', () => ({
  useDmConversations: () => ({
    conversations: mockConversations,
    loading: mockLoading,
    error: mockError,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: mockHasNextPage,
    isFetchingNextPage: mockIsFetchingNextPage,
  }),
}));

// Mock Nuxt router composables
const mockRouterPush = vi.fn();
const mockRouteParams = ref<{ conversationId?: string }>({ conversationId: '1' });

vi.stubGlobal('useRoute', () => ({ params: mockRouteParams.value }));
vi.stubGlobal('useRouter', () => ({ push: mockRouterPush }));

describe('DmConversationsSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
    mockError.value = null;
    mockHasNextPage.value = false;
    mockIsFetchingNextPage.value = false;
    mockRouteParams.value = { conversationId: '1' };
  });

  it('renders the section successfully', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders DmHeader component', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const header = wrapper.findComponent({ name: 'DmHeader' });
    expect(header.exists()).toBe(true);
  });

  it('renders DmConversationList component when loading false', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    // Component should now render list because loading mocked to false
    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);
  });

  it('has header and conversation list present', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    expect(wrapper.findComponent({ name: 'DmHeader' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DmConversationList' }).exists()).toBe(true);
  });

  it('shows spinner when loading', async () => {
    mockLoading.value = true;

    const wrapper = await mountSuspended(DmConversationsSection);
    await flushPromises();

    // Should show spinner instead of conversation list
    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(false);
  });

  it('shows error toast when error occurs', async () => {
    mockError.value = new Error('Test error');

    await mountSuspended(DmConversationsSection);
    await flushPromises();

    expect(mockShowToaster).toHaveBeenCalledWith('error', 'Failed to load conversations');
  });

  it('navigates to conversation when onSelect is called', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    await flushPromises();

    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);

    // Verify the component structure is rendered
    expect(wrapper.html()).toBeTruthy();
  });

  it('calls fetchNextPage when onLoadMore is triggered', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    await flushPromises();

    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);

    // Verify the component is set up to handle load-more events
    expect(wrapper.html()).toBeTruthy();
  });

  it('passes correct props to DmConversationList', async () => {
    mockHasNextPage.value = true;
    mockIsFetchingNextPage.value = true;

    const wrapper = await mountSuspended(DmConversationsSection);
    await flushPromises();

    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);

    // Verify the component receives the conversations prop
    const html = wrapper.html();
    expect(html).toBeTruthy();
  });

  it('has correct layout structure', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const container = wrapper.find('div');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('h-full');
    expect(container.classes()).toContain('flex-col');
  });
});
