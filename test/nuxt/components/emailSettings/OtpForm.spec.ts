import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import { reactive } from 'vue';

async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

// Stub Dialog components to avoid teleport issues
const dialogStubs = {
  UiDialog: { template: '<div><slot /></div>', props: ['open'] },
  UiDialogContent: { template: '<div><slot /></div>' },
  UiDialogHeader: { template: '<div><slot /></div>' },
  UiDialogTitle: { template: '<div><slot /></div>' },
  UiDialogDescription: { template: '<div><slot /></div>' },
  UiDialogFooter: { template: '<div><slot /></div>' },
};

describe('EmailSettings/OtpForm.vue', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders otp input and resend button', async () => {
    const mockStore = reactive({
      isOpen: true,
      step: 'otp',
      email: 'test@example.com',
      handleOtpSubmit: vi.fn().mockResolvedValue(false),
      handleDialogChange: vi.fn(),
      handleResendOtp: vi.fn(),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => mockStore,
    }));

    const { default: OtpForm } = await import('@/components/emailSettings/OtpForm.vue');

    const wrapper = await mountSuspended(OtpForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const otpField = wrapper.find('input[name="otp"]');
    const resendBtn = wrapper.find('[data-cy="change-email-otp-resend-btn"]');
    expect(otpField.exists()).toBe(true);
    expect(resendBtn.exists()).toBe(true);
  });

  it('calls resend when clicking resend button', async () => {
    const mockStore = reactive({
      isOpen: true,
      step: 'otp',
      email: 'test@example.com',
      handleOtpSubmit: vi.fn().mockResolvedValue(false),
      handleDialogChange: vi.fn(),
      handleResendOtp: vi.fn(),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => mockStore,
    }));

    const { default: OtpForm } = await import('@/components/emailSettings/OtpForm.vue');
    const wrapper = await mountSuspended(OtpForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const resendBtn = wrapper.find('[data-cy="change-email-otp-resend-btn"]');
    await resendBtn.trigger('click');
    expect(mockStore.handleResendOtp).toHaveBeenCalledTimes(1);
  });

  it('submits form and routes to account settings', async () => {
    const mockStore = reactive({
      isOpen: true,
      step: 'otp',
      email: 'test@example.com',
      handleOtpSubmit: vi.fn().mockResolvedValueOnce(true),
      handleDialogChange: vi.fn(),
      handleResendOtp: vi.fn(),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => mockStore,
    }));

    const { default: OtpForm } = await import('@/components/emailSettings/OtpForm.vue');

    const wrapper = await mountSuspended(OtpForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const form = wrapper.find('[data-cy="change-email-otp-form"]');
    const otpField = wrapper.find('input[name="otp"]');
    expect(otpField.exists()).toBe(true);
    await otpField.setValue('123456');
    await form.trigger('submit');
    await flushPromises();

    expect(mockStore.handleOtpSubmit).toHaveBeenCalledWith('123456');
  });

  it('shows error message when OTP is invalid', async () => {
    const mockStore = reactive({
      isOpen: true,
      step: 'otp',
      email: 'test@example.com',
      handleOtpSubmit: vi.fn().mockResolvedValueOnce(false),
      handleDialogChange: vi.fn(),
      handleResendOtp: vi.fn(),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => mockStore,
    }));

    const { default: OtpForm } = await import('@/components/emailSettings/OtpForm.vue');

    const wrapper = await mountSuspended(OtpForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const form = wrapper.find('[data-cy="change-email-otp-form"]');
    const otpField = wrapper.find('input[name="otp"]');
    await otpField.setValue('123456');
    await form.trigger('submit');
    await flushPromises();

    expect(mockStore.handleOtpSubmit).toHaveBeenCalledWith('123456');
    const errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.INVALID_OTP'));
  });
});
