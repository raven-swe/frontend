import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationHeader from '@/components/dm/conversation/DmConversationHeader.vue';

describe('DmConversationHeader Component', () => {
  const mockProps = {
    username: 'testuser',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  };

  it('renders the header with correct structure', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('bg-background');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('justify-between');
  });

  it('displays the participant avatar', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe(mockProps.avatarUrl);
    expect(avatar.classes()).toContain('rounded-full');
    expect(avatar.classes()).toContain('size-12');
  });

  it('displays the username', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const username = wrapper.find('span.text-lg');
    expect(username.exists()).toBe(true);
    expect(username.text()).toBe(mockProps.username);
    expect(username.classes()).toContain('font-bold');
  });

  it('renders the report icon', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const html = wrapper.html();
    expect(html).toContain('ic:round-report-gmailerrorred');
  });

  it('has sticky positioning', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const container = wrapper.find('div');
    expect(container.classes()).toContain('sticky');
    expect(container.classes()).toContain('top-0');
  });

  it('renders avatar with proper accessibility attributes', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const avatar = wrapper.find('img');
    expect(avatar.attributes('alt')).toBe('Profile picture');
    expect(avatar.attributes('loading')).toBe('eager');
  });

  it('displays avatar and username in a flex container', async () => {
    const wrapper = await mountSuspended(DmConversationHeader, {
      props: mockProps,
    });

    const innerContainer = wrapper.find('.flex.items-center.gap-6');
    expect(innerContainer.exists()).toBe(true);
  });
});
