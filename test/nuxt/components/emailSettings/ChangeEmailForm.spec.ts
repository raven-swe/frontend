import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('ChangeEmailForm.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fields render correctly', async () => {
    const changeEmailStore = reactive({
      isOpen: true,
      step: 'email',
      handleEmailSubmit: vi.fn(),
      handleDialogChange: vi.fn(),
    });

    const userStore = reactive({
      user: { email: 'current@example.com' },
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => changeEmailStore,
    }));

    vi.doMock('@/stores/user', () => ({
      useUserStore: () => userStore,
    }));

    const registerationService = reactive({
      checkEmail: vi.fn().mockResolvedValue(false),
    });

    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    const { default: ChangeEmailForm } =
      await import('@/components/emailSettings/ChangeEmailForm.vue');

    const wrapper = await mountSuspended(ChangeEmailForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const emailField = wrapper.find('input[name="email"]');
    expect(emailField.exists()).toBe(true);
  });

  it('shows validation errors on invalid email or already exists', async () => {
    const changeEmailStore = reactive({
      isOpen: true,
      step: 'email',
      handleEmailSubmit: vi.fn(),
      handleDialogChange: vi.fn(),
    });

    const userStore = reactive({
      user: { email: 'current@example.com' },
    });

    const registerationService = reactive({
      checkEmail: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => changeEmailStore,
    }));

    vi.doMock('@/stores/user', () => ({
      useUserStore: () => userStore,
    }));

    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    const { default: ChangeEmailForm } =
      await import('@/components/emailSettings/ChangeEmailForm.vue');

    const wrapper = await mountSuspended(ChangeEmailForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const emailField = wrapper.find('input[name="email"]');

    // First: invalid
    await emailField.setValue('');
    await emailField.trigger('blur');
    await flushPromises();
    let errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.INVALID_EMAIL'));

    // Second: valid
    await emailField.setValue('john.doe@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(false);

    // Third: already exists
    await emailField.setValue('test@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.EMAIL_ALREADY_EXISTS'));

    // Fourth: change email to non-existing
    await emailField.setValue('john.doe@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(false);
  });

  it('submits form with valid input', async () => {
    const changeEmailStore = reactive({
      isOpen: true,
      step: 'email',
      handleEmailSubmit: vi.fn(),
      handleDialogChange: vi.fn(),
    });

    const userStore = reactive({
      user: { email: 'current@example.com' },
    });

    const registerationService = reactive({
      checkEmail: vi.fn().mockResolvedValue(false),
    });

    vi.doMock('@/stores/settings/change-email', () => ({
      useChangeEmailStore: () => changeEmailStore,
    }));

    vi.doMock('@/stores/user', () => ({
      useUserStore: () => userStore,
    }));

    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    const { default: ChangeEmailForm } =
      await import('@/components/emailSettings/ChangeEmailForm.vue');

    const wrapper = await mountSuspended(ChangeEmailForm, {
      global: {
        plugins: [i18n],
        stubs: dialogStubs,
      },
    });

    const emailField = wrapper.find('input[name="email"]');
    const form = wrapper.find('form');

    await emailField.setValue('newemail@example.com');
    await emailField.trigger('blur');
    await flushPromises();

    await form.trigger('submit');
    await flushPromises();

    expect(changeEmailStore.handleEmailSubmit).toHaveBeenCalledWith('newemail@example.com');
  });
});
