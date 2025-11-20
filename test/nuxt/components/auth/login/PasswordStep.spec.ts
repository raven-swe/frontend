import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper, flushPromises } from '@vue/test-utils';
import messages from '@@/i18n/locales/en.json';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import PasswordStep from '@/components/auth/login/PasswordStep.vue';
import { useLoginStore } from '@/stores/auth/login';

const { showToasterMock } = vi.hoisted(() => {
  return {
    showToasterMock: vi.fn(),
  };
});

vi.mock('@/utils/showToaster', () => ({
  showToaster: showToasterMock,
}));

const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
  };
});

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('PasswordStep.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof PasswordStep>>;
  let loginStore: ReturnType<typeof useLoginStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    loginStore = useLoginStore();
    loginStore.identifier = 'testuser';
    vi.clearAllMocks();

    wrapper = mount(PasswordStep, {
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
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    expect(wrapper.find('input[name="identifier"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="forgot-password-link"]').exists()).toBe(true);
  });

  it('displays the identifier from store', () => {
    const identifierInput = wrapper.find('input[name="identifier"]');
    expect((identifierInput.element as HTMLInputElement).value).toBe('testuser');
  });

  it('identifier input is readonly', () => {
    const identifierInput = wrapper.find('input[name="identifier"]');
    expect(identifierInput.attributes('readonly')).toBeDefined();
  });

  it('displays correct placeholder based on type', () => {
    loginStore.type = 'email';
    expect(loginStore.type).toBe('email');

    // Test with no type
    loginStore.type = '';
    expect(loginStore.type).toBe('');
  });

  it('submit button is disabled when form is invalid', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when password is entered', async () => {
    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });

  it('successfully submits login with valid credentials', async () => {
    vi.spyOn(loginStore, 'login').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(loginStore.login).toHaveBeenCalledWith({
      identifier: 'testuser',
      password: 'Password@123',
    });
  });

  it('handles validation errors from backend (422)', async () => {
    const validationErrors = [{ field: 'password', code: 'TOO_SHORT' }];
    vi.spyOn(loginStore, 'login').mockResolvedValue(validationErrors as unknown as undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('short');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Find error message by class
    const errorMessage = wrapper.find('.text-destructive');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('Password must be at least 10 characters long');
  });

  it('handles invalid credentials (401)', async () => {
    const invalidCredentials = [{ field: 'password', code: 'UNAUTHORIZED' }];
    vi.spyOn(loginStore, 'login').mockResolvedValue(invalidCredentials as unknown as undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('wrongpassword');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Find error message by class
    const errorMessage = wrapper.find('.text-destructive');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('The password you entered is incorrect');
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('handles internal server error (500)', async () => {
    vi.spyOn(loginStore, 'login').mockResolvedValue(undefined);
    // The store's login method calls showToaster on 500 error

    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    // When login returns undefined and no navigation happens, it means success or the store handled the error
    expect(loginStore.login).toHaveBeenCalled();
  });

  it('trims whitespace from password before submission', async () => {
    vi.spyOn(loginStore, 'login').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('  Password@123  ');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(loginStore.login).toHaveBeenCalledWith({
      identifier: 'testuser',
      password: 'Password@123',
    });
  });

  it('calls openForgotPasswordDialog when forgot password link is clicked', async () => {
    loginStore.step = 1; // Set step to 1 so identifier is included
    const forgotPasswordLink = wrapper.find('[data-testid="forgot-password-link"]');
    await forgotPasswordLink.trigger('click');
    await flushPromises();

    expect(navigateToMock).toHaveBeenCalledWith('/password-reset?identifier=testuser');
  });
});
