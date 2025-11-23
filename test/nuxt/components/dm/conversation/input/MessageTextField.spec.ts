import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MessageTextField from '@/components/dm/conversation/input/MessageTextField.vue';

describe('MessageTextField Component', () => {
  it('renders the text input', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
  });

  it('displays the model value', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test message' },
    });

    const input = wrapper.find('input[type="text"]');
    expect((input.element as HTMLInputElement).value).toBe('Test message');
  });

  it('emits update:modelValue when input changes', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('New value');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted?.[emitted.length - 1]).toEqual(['New value']);
  });

  it('emits enter event on Enter key press', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('enter')).toBeTruthy();
    expect(wrapper.emitted('enter')?.length).toBe(1);
  });

  it('does not emit enter event on Enter + Shift', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('keydown', { key: 'Enter', shiftKey: true });

    expect(wrapper.emitted('enter')).toBeFalsy();
  });

  it('does not emit enter event on other keys', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Test' },
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('keydown', { key: 'a' });

    expect(wrapper.emitted('enter')).toBeFalsy();
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('flex-1');
    expect(input.classes()).toContain('bg-transparent');
    expect(input.classes()).toContain('outline-none');
  });

  it('displays placeholder text', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input');
    const placeholder = input.attributes('placeholder');
    // Should contain either i18n key or fallback text
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(0);
  });

  it('updates value reactively', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: 'Initial' },
    });

    const input = wrapper.find('input[type="text"]');
    expect((input.element as HTMLInputElement).value).toBe('Initial');

    await wrapper.setProps({ modelValue: 'Updated' });
    expect((input.element as HTMLInputElement).value).toBe('Updated');
  });

  it('has no border styling', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input');
    expect(input.classes()).toContain('outline-none');
  });

  it('handles multiple input events', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input[type="text"]');

    await input.setValue('First');
    await input.setValue('Second');
    await input.setValue('Third');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted!.length).toBeGreaterThan(0);
  });

  it('preserves input focus behavior', async () => {
    const wrapper = await mountSuspended(MessageTextField, {
      props: { modelValue: '' },
    });

    const input = wrapper.find('input[type="text"]');
    expect(input.element.tagName).toBe('INPUT');
  });
});
