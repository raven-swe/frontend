import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';

describe('FieldInput.vue', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and error message when error exists', async () => {
    // mock vee-validate
    vi.doMock('vee-validate', () => ({
      useField: () => ({
        value: ref(''),
        errorMessage: 'This field is required',
      }),
    }));

    const { default: FieldInput } = await import('@/components/ui/form/FieldInput.vue');

    const wrapper = await mountSuspended(FieldInput, {
      props: { name: 'email', placeholder: 'Email' },
      attrs: { class: 'my-field' },
    });

    // check placeholder
    const span = wrapper.get('span');
    expect(span.text()).toBe('Email');

    const input = wrapper.get('input');
    // check aria-invalid is true when error exists
    expect(input.attributes('aria-invalid')).toBe('true');

    // check that outer div received class from $attrs
    expect(wrapper.classes()).toContain('my-field');

    // check that error paragraph renders
    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe('This field is required');
    expect(p.classes()).toContain('text-destructive');
  });

  it('renders input without error and updates value', async () => {
    vi.doMock('vee-validate', () => ({
      useField: () => ({
        value: ref(''),
        errorMessage: '',
      }),
    }));

    const { default: FieldInput } = await import('@/components/ui/form/FieldInput.vue');

    const wrapper = await mountSuspended(FieldInput, {
      props: { name: 'username', placeholder: 'Username' },
    });

    const input = wrapper.get('input');

    // check aria-invalid when no error
    expect(input.attributes('aria-invalid')).toBe('false');

    // check no error paragraph exists
    expect(wrapper.find('p').exists()).toBe(false);

    await input.setValue('john');
    expect((input.element as HTMLInputElement).value).toBe('john');
  });
});
