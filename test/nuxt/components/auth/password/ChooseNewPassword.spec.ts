import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import { nextTick } from 'vue';
import ChooseNewPassword from '@/components/auth/password/ChooseNewPassword.vue';
import { usePasswordStore } from '@/stores/auth/password';

// Mock showToaster - must be hoisted
const { showToasterMock } = vi.hoisted(() => {
  return {
    showToasterMock: vi.fn(),
  };
});

vi.mock('@/utils/showToaster', () => ({
  showToaster: showToasterMock,
}));

// Mock router
const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
  };
});

mockNuxtImport('useRouter', () => {
  return () => ({
    push: navigateToMock,
  });
});

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('ChooseNewPassword.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ChooseNewPassword>>;
  let passwordStore: ReturnType<typeof usePasswordStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    passwordStore = usePasswordStore();
    vi.clearAllMocks();

    wrapper = mount(ChooseNewPassword, {
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogHeader: {
            template: '<div class="ui-dialog-header"><slot /></div>',
          },
          UiDialogTitle: {
            template: '<h2 class="ui-dialog-title"><slot /></h2>',
          },
          UiDialogFooter: {
            template: '<div class="ui-dialog-footer"><slot /></div>',
          },
        },
      },
    });
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('[data-testid="new-password-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="confirm-password-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
  });

  it('submit button is disabled when form is invalid', async () => {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('submit button is disabled when password is too short', async () => {
    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('1234567');
    await confirmPasswordInput.setValue('1234567');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('submit button is disabled when passwords do not match', async () => {
    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('password456');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when passwords match and are valid', async () => {
    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('Password@123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });

  it('successfully submits valid password', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockResolvedValue(undefined);

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('Password@123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('Password@123');
  });

  it('shows error when password reset fails with validation error', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockResolvedValue([
      { field: 'newPassword', code: 'TOO_SHORT' },
    ]);

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('Password@123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('Password@123');
    // Check that error is displayed in the form
    const errorText = wrapper.text();
    expect(errorText).toContain('Password must be at least 10 characters long');
  });

  it('handles generic error during submission - store shows toaster internally', async () => {
    // resetPassword returns undefined on success or non-validation errors
    // The store handles toaster internally for generic errors
    vi.spyOn(passwordStore, 'resetPassword').mockResolvedValue(undefined);

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('Password@123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('Password@123');
  });

  it('successfully submits when no validation errors returned', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockResolvedValue(undefined);

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('Password@123');
    await confirmPasswordInput.setValue('Password@123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('Password@123');
  });
});
