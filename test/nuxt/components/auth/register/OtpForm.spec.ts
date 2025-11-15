import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Dialog from '~/components/ui/dialog/Dialog.vue';
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

describe('OtpForm.vue', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fields render correctly', async () => {
    const { default: OtpForm } = await import('@/components/auth/register/OtpForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { OtpForm, Dialog },
        template: `
			<Dialog open>
				<OtpForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const otpField = wrapper.find('input[name="otp"]');
    expect(otpField.exists()).toBe(true);
  });

  it('shows validation errors on invalid otp', async () => {
    const store = reactive({
      submitOtp: vi.fn(),
    });

    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: OtpForm } = await import('@/components/auth/register/OtpForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { OtpForm, Dialog },
        template: `
			<Dialog open>
				<OtpForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const otpField = wrapper.find('input[name="otp"]');
    await otpField.setValue('123');
    await otpField.trigger('blur');
    await flushPromises();
    let errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.OTP_MUST_6'));

    await otpField.setValue('1234567890');
    await otpField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.OTP_MUST_6'));

    // Second: valid
    await otpField.setValue('123456');
    await otpField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(false);
  });

  it('submits form with valid input', async () => {
    const store = reactive({
      submitOtp: vi
        .fn()
        .mockReturnValueOnce([{ field: 'otp', code: 'INVALID_TOKEN' }])
        .mockReturnValueOnce(undefined),
    });

    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: OtpForm } = await import('@/components/auth/register/OtpForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { OtpForm, Dialog },
        template: `
			<Dialog open>
				<OtpForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const form = wrapper.find('form');
    const otpField = wrapper.find('input[name="otp"]');
    expect(otpField.exists()).toBe(true);
    await otpField.setValue('123456');
    await otpField.trigger('blur');
    await form.trigger('submit');
    await flushPromises();
    expect(store.submitOtp).toHaveBeenCalledWith('123456');
    let errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.INVALID_OTP'));
    // Submit again to test success path
    await form.trigger('submit');
    await flushPromises();
    expect(store.submitOtp).toHaveBeenCalledTimes(2);
    errorMessage = wrapper.find('[data-test-id="otp-error"]');
    expect(errorMessage.exists()).toBe(false);
  });
});
