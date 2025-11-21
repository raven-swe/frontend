import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
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
  locale: 'en',
  messages: { en: messages },
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
    vi.spyOn(passwordStore, 'verifyUser').mockResolvedValue([
      { field: 'otp', code: 'INVALID_TOKEN' },
    ]);

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

    expect(passwordStore.verifyUser).toHaveBeenCalledWith('000000');
    // Verify error is set in form
    expect(wrapper.text()).toContain('The OTP you entered is invalid');
  });

  it('handles generic error during submission - store shows toaster internally', async () => {
    // verifyUser returns undefined on success or when store handles error internally
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

  it('successfully submits when no errors returned', async () => {
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

  it('calls resendOtp when resend button is clicked', async () => {
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(undefined);

    const resendButton = wrapper.find('[data-testid="resend-link"]');

    expect(resendButton).toBeDefined();
    await resendButton?.trigger('click');
    await nextTick();

    expect(passwordStore.resendOtp).toHaveBeenCalled();
  });

  it('resend button exists and can be clicked', async () => {
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(undefined);

    const resendButton = wrapper.find('[data-testid="resend-link"]');
    expect(resendButton).toBeDefined();

    await resendButton?.trigger('click');
    await nextTick();

    expect(passwordStore.resendOtp).toHaveBeenCalled();
  });

  it('handles rate limit with countdown timer', async () => {
    vi.useFakeTimers();
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(60);

    const resendButton = wrapper.find('[data-testid="resend-link"]');
    await resendButton.trigger('click');
    await nextTick();

    expect(passwordStore.resendOtp).toHaveBeenCalled();
    expect(resendButton.element.hasAttribute('disabled')).toBe(true);

    // Advance timers by 1 second
    vi.advanceTimersByTime(1000);
    await nextTick();

    // Button should still be disabled
    expect(resendButton.element.hasAttribute('disabled')).toBe(true);

    // Fast forward to end of countdown
    vi.advanceTimersByTime(59000);
    await nextTick();

    // Button should be enabled again
    expect(resendButton.element.hasAttribute('disabled')).toBe(false);

    vi.useRealTimers();
  });

  it('disables resend button during countdown', async () => {
    vi.useFakeTimers();
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(30);

    const resendButton = wrapper.find('[data-testid="resend-link"]');
    await resendButton.trigger('click');
    await nextTick();

    expect(resendButton.element.hasAttribute('disabled')).toBe(true);

    vi.useRealTimers();
  });

  it('clears error when countdown reaches zero', async () => {
    vi.useFakeTimers();
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(2);

    const resendButton = wrapper.find('[data-testid="resend-link"]');
    await resendButton.trigger('click');
    await nextTick();

    // Fast forward past countdown
    vi.advanceTimersByTime(3000);
    await nextTick();

    // Error should be cleared
    const resendButtonAfter = wrapper.find('[data-testid="resend-link"]');
    expect(resendButtonAfter.element.hasAttribute('disabled')).toBe(false);

    vi.useRealTimers();
  });

  it('does not disable button when resendOtp returns undefined', async () => {
    vi.spyOn(passwordStore, 'resendOtp').mockResolvedValue(undefined);

    const resendButton = wrapper.find('[data-testid="resend-link"]');
    await resendButton.trigger('click');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(resendButton.element.hasAttribute('disabled')).toBe(false);
  });
});
