import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('FindAccount.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders the form with identifier input field', async () => {
    const recaptchaRenderfn = vi.fn().mockImplementation(({ callback }) => {
      callback('mock-recaptcha-token');
    });

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: recaptchaRenderfn,
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    const submitButton = wrapper.find('[data-testid="submit-button"]');

    expect(identifierField.exists()).toBe(true);
    expect(submitButton.exists()).toBe(true);
  });

  it('shows validation error when identifier is empty', async () => {
    const recaptchaRenderfn = vi.fn().mockImplementation(({ callback }) => {
      callback('mock-recaptcha-token');
    });

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: recaptchaRenderfn,
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');

    await identifierField.setValue('');
    await identifierField.trigger('blur');
    await flushPromises();

    const errorMessage = wrapper.find('[data-test-id="identifier-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.IDENTIFIER_REQUIRED'));
  });

  it('disables submit button when form is invalid', async () => {
    // Don't call the callback immediately to simulate recaptcha not being completed
    const recaptchaRenderfn = vi.fn().mockImplementation(() => {
      // No callback invocation
    });

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: recaptchaRenderfn,
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();

    const submitButton = wrapper.find('[data-testid="submit-button"]');

    // Button should be disabled when recaptcha is not completed
    expect(submitButton.attributes('disabled')).toBe('');
  });

  it('enables submit button when form is valid and recaptcha is completed', async () => {
    const recaptchaRenderfn = vi.fn().mockImplementation(({ callback }) => {
      callback('mock-recaptcha-token');
    });

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: recaptchaRenderfn,
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    await identifierField.setValue('user@example.com');
    await flushPromises();

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.attributes('disabled')).toBeUndefined();
  });

  it('calls passwordStore.checkUserExists on valid form submission', async () => {
    const passwordStore = reactive({
      identifier: '',
      checkUserExists: vi.fn().mockResolvedValue(true),
    });

    vi.doMock('@/stores/auth/password', () => ({
      usePasswordStore: () => passwordStore,
    }));

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: vi.fn().mockImplementation(({ callback }) => {
          callback('mock-recaptcha-token');
        }),
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    const form = wrapper.find('form');

    await identifierField.setValue('user@example.com');
    await flushPromises();
    await form.trigger('submit');
    await flushPromises();

    expect(passwordStore.checkUserExists).toHaveBeenCalledWith({
      identifier: 'user@example.com',
      recaptchaToken: 'mock-recaptcha-token',
    });
  });

  it('trims whitespace from identifier before submission', async () => {
    const passwordStore = reactive({
      identifier: '',
      checkUserExists: vi.fn().mockResolvedValue(true),
    });

    vi.doMock('@/stores/auth/password', () => ({
      usePasswordStore: () => passwordStore,
    }));

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: vi.fn().mockImplementation(({ callback }) => {
          callback('mock-recaptcha-token');
        }),
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    const form = wrapper.find('form');

    await identifierField.setValue('  user@example.com  ');
    await flushPromises();
    await form.trigger('submit');
    await flushPromises();

    expect(passwordStore.checkUserExists).toHaveBeenCalledWith({
      identifier: 'user@example.com',
      recaptchaToken: 'mock-recaptcha-token',
    });
  });

  it('handles submission errors gracefully', async () => {
    const passwordStore = reactive({
      identifier: '',
      checkUserExists: vi.fn().mockRejectedValue(new Error('User not found')),
    });

    const showToaster = vi.fn();

    vi.doMock('@/stores/auth/password', () => ({
      usePasswordStore: () => passwordStore,
    }));

    vi.doMock('@/utils/showToaster', () => ({
      showToaster,
    }));

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: vi.fn().mockImplementation(({ callback }) => {
          callback('mock-recaptcha-token');
        }),
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    const form = wrapper.find('form');

    await identifierField.setValue('nonexistent@example.com');
    await flushPromises();
    await form.trigger('submit');
    await flushPromises();

    expect(showToaster).toHaveBeenCalledWith('error', 'User not found');
  });

  it('resets recaptcha field when expired callback is triggered', async () => {
    let expiredCallbackFn: (() => void) | undefined;

    const recaptchaRenderfn = vi.fn().mockImplementation(({ callback, expiredCallback }) => {
      callback('mock-recaptcha-token');
      expiredCallbackFn = expiredCallback;
    });

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: recaptchaRenderfn,
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    await flushPromises();

    // Trigger the expired callback
    if (expiredCallbackFn) {
      expiredCallbackFn();
    }

    await flushPromises();

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('initializes identifier field with value from store', async () => {
    const passwordStore = reactive({
      identifier: 'preset@example.com',
      checkUserExists: vi.fn(),
    });

    vi.doMock('@/stores/auth/password', () => ({
      usePasswordStore: () => passwordStore,
    }));

    vi.doMock('@/composables/useRecaptcha', () => ({
      default: () => ({
        render: vi.fn().mockImplementation(({ callback }) => {
          callback('mock-recaptcha-token');
        }),
      }),
    }));

    const { default: FindAccount } = await import('@/components/auth/password/FindAccount.vue');

    const wrapper = await mountSuspended(
      {
        components: { FindAccount, Dialog },
        template: `
          <Dialog open>
            <FindAccount />
          </Dialog>
        `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const identifierField = wrapper.find('input[name="identifier"]');
    expect((identifierField.element as HTMLInputElement).value).toBe('preset@example.com');
  });
});
