import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import SentCode from '@/components/auth/password/SentCode.vue';
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
      'errors.GENERIC_ERROR': 'An error occurred',
      'root.auth.we-sent-code': 'We sent you a code',
      'root.auth.enter-otp': 'Enter it below to verify your account',
      'root.auth.enter-your-code': 'Enter your code',
      'root.auth.resend-code': 'Resend code',
      'ui.next': 'Next',
    },
  },
});

describe('SentCode.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof SentCode>>;
  let passwordStore: ReturnType<typeof usePasswordStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    passwordStore = usePasswordStore();
    vi.clearAllMocks();

    wrapper = mount(SentCode, {
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
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
  });

  it('submit button is disabled when form is invalid', async () => {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when OTP is entered', async () => {
    const input = wrapper.find('input[name="otp"]');
    await input.setValue('123456');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });

  it('successfully submits valid OTP', async () => {
    vi.spyOn(passwordStore, 'verifyUser').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="otp"]');
    await input.setValue('123456');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.verifyUser).toHaveBeenCalledWith('123456');
  });

  it('shows error when OTP verification fails', async () => {
    vi.spyOn(passwordStore, 'verifyUser').mockRejectedValue(new Error('Invalid OTP'));

    const input = wrapper.find('input[name="otp"]');
    await input.setValue('000000');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'Invalid OTP');
  });

  it('handles generic error during submission', async () => {
    vi.spyOn(passwordStore, 'verifyUser').mockRejectedValue(new Error('Network error'));

    const input = wrapper.find('input[name="otp"]');
    await input.setValue('123456');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'Network error');
  });

  it('handles error without message', async () => {
    vi.spyOn(passwordStore, 'verifyUser').mockRejectedValue({});

    const input = wrapper.find('input[name="otp"]');
    await input.setValue('123456');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'An error occurred');
  });

  it('trims whitespace from OTP before submission', async () => {
    vi.spyOn(passwordStore, 'verifyUser').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="otp"]');
    await input.setValue('  123456  ');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(passwordStore.verifyUser).toHaveBeenCalledWith('123456');
  });

  it('calls resendOtp when resend button is clicked', async () => {
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(undefined);

    const resendButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Resend code'));

    expect(resendButton).toBeDefined();
    await resendButton?.trigger('click');
    await nextTick();

    expect(passwordStore.resendOtp).toHaveBeenCalled();
  });

  it('resend button exists and can be clicked', async () => {
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(undefined);

    const resendButton = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Resend code'));

    expect(resendButton).toBeDefined();

    await resendButton?.trigger('click');
    await nextTick();

    expect(passwordStore.resendOtp).toHaveBeenCalled();
  });
});
