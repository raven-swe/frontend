import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import DmConversationsSection from '@/components/dm/DmConversationsSection.vue';

const mockConversations = [
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
];

vi.mock('@/composables/useDmConversations', () => ({
  useDmConversations: () => ({
    conversations: ref(mockConversations),
    loading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { conversationId: '1' } }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe('DmConversationsSection Component', () => {
  it('renders the section successfully', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders DmHeader component', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const header = wrapper.findComponent({ name: 'DmHeader' });
    expect(header.exists()).toBe(true);
  });

  it('renders DmSearchBar component', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const searchBar = wrapper.findComponent({ name: 'DmSearchBar' });
    expect(searchBar.exists()).toBe(true);
  });

  it('renders DmConversationList component when loading false', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    // Component should now render list because loading mocked to false
    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);
  });

  it('has header, search bar, and conversation list present', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);
    expect(wrapper.findComponent({ name: 'DmHeader' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DmSearchBar' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DmConversationList' }).exists()).toBe(true);
  });
});
