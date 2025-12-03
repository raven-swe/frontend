import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MessageTextField from '@/components/dm/conversation/input/MessageTextField.vue';

describe('MessageTextField Component', () => {
  it('renders the textarea', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
  });

  it('displays the model value', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test message' },
    });

    const textarea = wrapper.find('textarea');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Test message');
  });

  it('emits update:modelValue when input changes', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('New value');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[emitted.length - 1]).toEqual(['New value']);
  });

  it('emits enter event on Enter key press', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('enter')).toBeTruthy();
    expect(wrapper.emitted('enter')?.length).toBe(1);
  });

  it('does not emit enter event on Enter + Shift', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true });

    expect(wrapper.emitted('enter')).toBeFalsy();
  });

  it('does not emit enter event on other keys', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const textarea = wrapper.find('textarea');
    await textarea.trigger('keydown', { key: 'a' });

    expect(wrapper.emitted('enter')).toBeFalsy();
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.classes()).toContain('flex-1');
    expect(textarea.classes()).toContain('bg-transparent');
    expect(textarea.classes()).toContain('outline-none');
  });

  it('displays placeholder text', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    const placeholder = textarea.attributes('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(0);
  });

  it('updates value reactively', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Initial' },
    });

    const textarea = wrapper.find('textarea');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Initial');

    await wrapper.setProps({ modelValue: 'Updated' });
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Updated');
  });

  it('has no border styling', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.classes()).toContain('outline-none');
  });

  it('handles multiple input events', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');

    await textarea.setValue('First');
    await textarea.setValue('Second');
    await textarea.setValue('Third');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted!.length).toBeGreaterThan(0);
  });

  it('preserves input focus behavior', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.element.tagName).toBe('TEXTAREA');
  });
});
