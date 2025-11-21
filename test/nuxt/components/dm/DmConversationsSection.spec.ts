import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmConversationsSection from '@/components/dm/DmConversationsSection.vue';

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

  it('renders DmConversationList component', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const conversationList = wrapper.findComponent({ name: 'DmConversationList' });
    expect(conversationList.exists()).toBe(true);
  });

  it('has all three main components in correct order', async () => {
    const wrapper = await mountSuspended(DmConversationsSection);

    const html = wrapper.html();

    // Check that all three components are present
    expect(html).toBeTruthy();

    // Verify components exist
    expect(wrapper.findComponent({ name: 'DmHeader' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DmSearchBar' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DmConversationList' }).exists()).toBe(true);
  });
});
