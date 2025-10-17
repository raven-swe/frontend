import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Input from '@/components/ui/Input.vue';

describe('Input Component', () => {
  it('renders label text', async () => {
    const wrapper = await mountSuspended(Input, {
      props: {
        placeholder: 'Test Label',
      },
    });
    expect(wrapper.get('span').text()).toBe('Test Label');
  });

  it('applies aria-invalid class when invalid', async () => {
    const wrapper = await mountSuspended(Input, {
      props: {
        placeholder: 'Test Label',
        'aria-invalid': 'true',
      },
    });
    const span = wrapper.get('span');
    expect(span.classes()).toContain('peer-[input[aria-invalid=true]]:text-destructive');
  });

  it('updates modelValue on input', async () => {
    const wrapper = await mountSuspended(Input, {
      props: { modelValue: '', placeholder: 'Label' },
    });
    const input = wrapper.get('input');

    await input.setValue('Hello world');
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    expect(wrapper.emitted()['update:modelValue']![0]).toEqual(['Hello world']);
  });

  it('handles focus and blur events', async () => {
    const wrapper = await mountSuspended(Input, {
      props: { modelValue: '', placeholder: 'Label' },
    });

    const input = wrapper.get('input');
    const label = wrapper.get('span');
    await input.trigger('focus');
    expect(label.classes()).toContain('text-primary');

    await input.trigger('blur');
    expect(label.classes()).toContain('text-muted-foreground');
  });
});
