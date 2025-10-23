import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
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

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'errors.PASSWORD_TOO_SHORT': 'Password is too short',
      'errors.PASSWORD_MISMATCH': 'Passwords do not match',
      'errors.GENERIC_ERROR': 'An error occurred',
      'root.auth.choose-new-password': 'Choose a new password',
      'root.auth.password-strength': 'Make sure it is strong',
      'root.auth.logout-warning': 'You will be logged out of all devices',
      'root.auth.password': 'Password',
      'root.auth.confirm-password': 'Confirm password',
      'root.auth.change-password': 'Change password',
    },
  },
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

    await newPasswordInput.setValue('password123');
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

    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');
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

    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('password123');
  });

  it('shows error when password reset fails', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockRejectedValue(new Error('Password reset failed'));

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'Password reset failed');
  });

  it('handles generic error during submission', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockRejectedValue(new Error('Network error'));

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'Network error');
  });

  it('handles error without message', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockRejectedValue({});

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'An error occurred');
  });

  it('trims whitespace from password before submission', async () => {
    vi.spyOn(passwordStore, 'resetPassword').mockResolvedValue(undefined);

    const newPasswordInput = wrapper.find('input[name="newPassword"]');
    const confirmPasswordInput = wrapper.find('input[name="confirmPassword"]');

    await newPasswordInput.setValue('  password123  ');
    await confirmPasswordInput.setValue('  password123  ');
    await newPasswordInput.trigger('input');
    await confirmPasswordInput.trigger('input');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.resetPassword).toHaveBeenCalledWith('password123');
  });
});
