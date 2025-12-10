import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationInfo from '@/components/dm/conversation/DmConversationInfo.vue';

const mockConversation = {
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
};

describe('DmConversationInfo Component', () => {
  it('renders nothing when conversation is null', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: null },
    });
    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('renders the info container when conversation provided', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const container = wrapper.find('div.p-4');
    expect(container.exists()).toBe(true);
  });

  it('renders a link to the profile page', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/profile/hussein');
  });

  it('displays the profile avatar with correct classes', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe('https://i.pravatar.cc/150?img=2');
    expect(avatar.classes()).toContain('rounded-full');
    expect(avatar.classes()).toContain('size-14');
  });

  it('displays the display name', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    expect(wrapper.html()).toContain('Hussein');
  });

  it('displays the @username', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    expect(wrapper.html()).toContain('@hussein');
  });

  // Removed tests for joined date, followers, and followed-by text as component no longer renders them.

  it('has hover and cursor classes on link', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const link = wrapper.find('a');
    expect(link.classes()).toContain('hover:bg-foreground/10');
    expect(link.classes()).toContain('cursor-pointer');
  });

  it('centers content in a flex column', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const link = wrapper.find('a');
    expect(link.classes()).toContain('flex');
    expect(link.classes()).toContain('flex-col');
    expect(link.classes()).toContain('items-center');
  });

  it('renders username with muted styling', async () => {
    const wrapper = await mountSuspended(DmConversationInfo, {
      props: { conversation: mockConversation },
    });
    const mutedTexts = wrapper.findAll('.text-muted-foreground');
    expect(mutedTexts.length).toBeGreaterThan(0);
    expect(mutedTexts[0]!.text()).toContain('@hussein');
  });
});
