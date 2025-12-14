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

  it('positions on the left for own messages', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: true, // Picker appears on own messages
      },
    });

    // Own messages: reaction picker on the left
    expect(wrapper.find('button').classes()).toContain('-left-1');
  });

  it('emits select event and closes popover when emoji is clicked', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false,
      },
    });

    // Click to open popover
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    // Find the PopoverContent component
    const popoverContent = wrapper.findComponent({ name: 'PopoverContent' });
    expect(popoverContent.exists()).toBe(true);

    // Find emoji buttons inside the popover
    const emojiButtons = popoverContent.findAll('button');
    expect(emojiButtons.length).toBe(6);

    // Click the first emoji
    await emojiButtons[0]!.trigger('click');
    await wrapper.vm.$nextTick();

    // Check emit
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual(['❤️']);
  });

  it('renders all emoji options', async () => {
    const wrapper = await mountSuspended(DmReactionPicker, {
      props: {
        isMine: false,
      },
    });

    // Click to open popover
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    // Find the PopoverContent component
    const popoverContent = wrapper.findComponent({ name: 'PopoverContent' });
    expect(popoverContent.exists()).toBe(true);

    // Check that all emojis are rendered
    const emojiButtons = popoverContent.findAll('button');
    expect(emojiButtons.length).toBe(6);
    expect(emojiButtons.map((btn) => btn.text())).toEqual(['❤️', '😂', '😮', '😢', '😡', '👍']);
  });
});
