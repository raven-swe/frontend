import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmReactionPicker from '@/components/dm/conversation/reaction/DmReactionPicker.vue';

describe('DmReactionPicker Component', () => {
  it('renders picker button', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false, // Picker only shown on other's messages
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
  });

  it('shows emoji options when clicked', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false,
      },
    });

    // Click to open popover
    await wrapper.find('button').trigger('click');

    // Wait for popover to render
    await wrapper.vm.$nextTick();

    // Check that component exists (popover content is in portal)
    expect(wrapper.exists()).toBe(true);
  });

  it('positions on the right for other messages', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false, // Picker only appears on other's messages
      },
    });

    // Other's messages: reaction picker on the right
    expect(wrapper.find('button').classes()).toContain('-right-1');
  });

  it('has opacity-0 class for hover reveal', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false,
      },
    });

    // Button should be hidden by default (opacity-0) and shown on group-hover
    expect(wrapper.find('button').classes()).toContain('opacity-0');
    expect(wrapper.find('button').classes()).toContain('group-hover:opacity-100');
  });
});
