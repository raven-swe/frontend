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

describe('PasswordForm.vue', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fields render correctly', async () => {
    const { default: PasswordForm } = await import('@/components/auth/register/PasswordForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { PasswordForm, Dialog },
        template: `
			<Dialog open>
				<PasswordForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const passwordField = wrapper.find('input[name="password"]');
    expect(passwordField.exists()).toBe(true);
  });

  it('shows validation errors on invalid password', async () => {
    const store = reactive({
      submitPassword: vi.fn(),
    });

    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: PasswordForm } = await import('@/components/auth/register/PasswordForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { PasswordForm, Dialog },
        template: `
			<Dialog open>
				<PasswordForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const passwordField = wrapper.find('input[name="password"]');
    // First: invalid length
    await passwordField.setValue('');
    await passwordField.trigger('blur');
    await flushPromises();
    let errorMessage = wrapper.find('[data-test-id="password-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.PASSWORD_TOO_SHORT'));

    // Invalid: does not meet complexity
    await passwordField.setValue('1234567890');
    await passwordField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="password-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.PASSWORD_INVALID'));

    // Second: valid
    await passwordField.setValue('ValidPassword@123!');
    await passwordField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="password-error"]');
    expect(errorMessage.exists()).toBe(false);
  });

  it('submits form with valid input', async () => {
    const store = reactive({
      submitPassword: vi.fn(),
    });

    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: PasswordForm } = await import('@/components/auth/register/PasswordForm.vue');
    const wrapper = await mountSuspended(
      {
        components: { PasswordForm, Dialog },
        template: `
			<Dialog open>
				<PasswordForm />
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
    const passwordField = wrapper.find('input[name="password"]');
    expect(passwordField.exists()).toBe(true);
    await passwordField.setValue('ValidPassword@123!');
    await passwordField.trigger('blur');
    await form.trigger('submit');
    await flushPromises();
    expect(store.submitPassword).toHaveBeenCalledWith('ValidPassword@123!');
  });
});
