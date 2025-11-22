import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MessageToolbar from '@/components/dm/conversation/input/MessageToolbar.vue';

describe('MessageToolbar Component', () => {
  it('renders the toolbar container', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('gap-3');
  });

  it('renders three action buttons', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);
  });

  it('renders add image button with icon', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');
  });

  it('renders add gif button with icon', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-gif-box');
  });

  it('renders add emoji button with icon', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const html = wrapper.html();
    expect(html).toContain('ic:baseline-insert-emoticon');
  });

  it('emits add-image event when image button is clicked', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    const imageButton = buttons[0];
    if (!imageButton) throw new Error('Image button not found');
    await imageButton.trigger('click');

    expect(wrapper.emitted('add-image')).toBeTruthy();
    expect(wrapper.emitted('add-image')?.length).toBe(1);
  });

  it('emits add-gif event when gif button is clicked', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    const gifButton = buttons[1];
    if (!gifButton) throw new Error('GIF button not found');
    await gifButton.trigger('click');

    expect(wrapper.emitted('add-gif')).toBeTruthy();
    expect(wrapper.emitted('add-gif')?.length).toBe(1);
  });

  it('emits add-emoji event when emoji button is clicked', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    const emojiButton = buttons[2];
    if (!emojiButton) throw new Error('Emoji button not found');
    await emojiButton.trigger('click');

    expect(wrapper.emitted('add-emoji')).toBeTruthy();
    expect(wrapper.emitted('add-emoji')?.length).toBe(1);
  });

  it('all buttons have type="button"', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.attributes('type')).toBe('button');
    });
  });

  it('all buttons have primary text color', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.classes()).toContain('text-primary');
    });
  });

  it('all buttons have hover effects', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.classes()).toContain('hover:opacity-80');
    });
  });

  it('all buttons have transition effects', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.classes()).toContain('transition-opacity');
    });
  });

  it('emits events independently', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    if (buttons.length < 3) throw new Error('Expected 3 buttons');

    await buttons[0]!.trigger('click');
    expect(wrapper.emitted('add-image')?.length).toBe(1);
    expect(wrapper.emitted('add-gif')).toBeFalsy();
    expect(wrapper.emitted('add-emoji')).toBeFalsy();

    await buttons[1]!.trigger('click');
    expect(wrapper.emitted('add-image')?.length).toBe(1);
    expect(wrapper.emitted('add-gif')?.length).toBe(1);
    expect(wrapper.emitted('add-emoji')).toBeFalsy();

    await buttons[2]!.trigger('click');
    expect(wrapper.emitted('add-image')?.length).toBe(1);
    expect(wrapper.emitted('add-gif')?.length).toBe(1);
    expect(wrapper.emitted('add-emoji')?.length).toBe(1);
  });

  it('buttons can be clicked multiple times', async () => {
    const wrapper = await mountSuspended(MessageToolbar);

    const buttons = wrapper.findAll('button');
    const imageButton = buttons[0];
    if (!imageButton) throw new Error('Image button not found');

    await imageButton.trigger('click');
    await imageButton.trigger('click');
    await imageButton.trigger('click');

    expect(wrapper.emitted('add-image')?.length).toBe(3);
  });
});
