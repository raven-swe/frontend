import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';

describe('PasswordField.vue', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default type password and shows error when present', async () => {
    // Mock vee-validate
    vi.doMock('vee-validate', () => ({
      useField: () => ({
        value: ref(''),
        errorMessage: 'Password is required',
      }),
    }));

    const { default: PasswordField } = await import('@/components/ui/form/FieldPassword.vue');

    const wrapper = await mountSuspended(PasswordField);

    const input = wrapper.get('input');
    expect(input.attributes('type')).toBe('password');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('toggles password visibility when button is clicked', async () => {
    vi.doMock('vee-validate', () => ({
      useField: () => ({
        value: ref(''),
        errorMessage: '',
      }),
    }));

    const { default: PasswordField } = await import('@/components/ui/form/FieldPassword.vue');

    const wrapper = await mountSuspended(PasswordField);

    const input = wrapper.get('input');
    const button = wrapper.get('button');

    // Initially hidden
    expect(input.attributes('type')).toBe('password');

    // Click the toggle button
    await button.trigger('mousedown');
    expect(input.attributes('type')).toBe('text');

    // Click again to hide
    await button.trigger('mousedown');
    expect(input.attributes('type')).toBe('password');
  });

  it('binds the v-model correctly and updates input value', async () => {
    vi.doMock('vee-validate', () => ({
      useField: () => ({
        value: ref(''),
        errorMessage: '',
      }),
    }));

    const { default: PasswordField } = await import('@/components/ui/form/FieldPassword.vue');

    const wrapper = await mountSuspended(PasswordField);
    const input = wrapper.get('input');

    await input.setValue('123456');
    expect((input.element as HTMLInputElement).value).toBe('123456');
  });
});
