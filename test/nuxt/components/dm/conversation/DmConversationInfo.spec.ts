import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationInfo from '@/components/dm/conversation/DmConversationInfo.vue';

describe('DmConversationInfo Component', () => {
  it('renders the info container with correct structure', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const container = wrapper.find('div.p-4');
    expect(container.exists()).toBe(true);
  });

  it('renders a link to the profile page', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/profile/hussein');
  });

  it('displays the profile avatar', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toBe('https://i.pravatar.cc/150?img=2');
    expect(avatar.classes()).toContain('rounded-full');
    expect(avatar.classes()).toContain('size-14');
  });

  it('displays the user name', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const html = wrapper.html();
    expect(html).toContain('Hussein');
  });

  it('displays the username', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const html = wrapper.html();
    expect(html).toContain('@hussein');
  });

  it('displays the joined date', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const html = wrapper.html();
    expect(html).toContain('January 2022');
  });

  it('displays the followers count', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const html = wrapper.html();
    expect(html).toContain('11 Followers');
  });

  it('displays the followed by text', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const html = wrapper.html();
    expect(html).toContain('not followed by anyone you follow');
  });

  it('has hover effect on the link', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const link = wrapper.find('a');
    expect(link.classes()).toContain('hover:bg-foreground/10');
    expect(link.classes()).toContain('cursor-pointer');
  });

  it('centers content in a flex column', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const link = wrapper.find('a');
    expect(link.classes()).toContain('flex');
    expect(link.classes()).toContain('flex-col');
    expect(link.classes()).toContain('items-center');
  });

  it('renders all text with proper styling', async () => {
    const wrapper = await mountSuspended(DmConversationInfo);

    const mutedTexts = wrapper.findAll('.text-muted-foreground');
    expect(mutedTexts.length).toBeGreaterThan(0);
  });
});
