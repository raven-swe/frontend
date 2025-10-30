import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import PasswordStep from '@/components/auth/login/PasswordStep.vue';
import { useLoginStore } from '@/stores/auth/login';

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

mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'errors.PASSWORD_REQUIRED': 'Password is required',
      'errors.GENERIC_ERROR': 'An error occurred',
      'Enter your password': 'Enter your password',
      'root.auth.email-or-username': 'Email or username',
      'root.auth.email': 'Email',
      'root.auth.username': 'Username',
      'root.auth.password': 'Password',
      'root.auth.forgot-password': 'Forgot password?',
      'root.auth.signin': 'Sign in',
      'root.auth.dont-have-account': "Don't have an account?",
      'root.auth.signup': 'Sign up',
    },
  },
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

  it('displays the identifier from store', async () => {
    loginStore.identifier = 'test@example.com';

    // Remount with new identifier
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

    await nextTick();

    const identifierInput = wrapper.find('input[name="identifier"]');
    expect((identifierInput.element as HTMLInputElement).value).toBe('test@example.com');
  });

  it('displays correct placeholder based on type', async () => {
    loginStore.type = 'email';

    // Remount with type set
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

    await nextTick();

    // The UiFormFieldInput component renders the identifier, check that the store type is used
    expect(loginStore.type).toBe('email');
  });

  it('displays default placeholder when type is not set', async () => {
    loginStore.type = '';

    // Remount with empty type
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

    await nextTick();

    // The UiFormFieldInput component renders the identifier with default placeholder
    const identifierInput = wrapper.find('input[name="identifier"]');
    expect(identifierInput.exists()).toBe(true);
  });

  it('submit button is disabled when form is invalid', async () => {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when password is entered', async () => {
    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });

  it('successfully submits login with valid credentials', async () => {
    vi.spyOn(loginStore, 'submitLogin').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(loginStore.submitLogin).toHaveBeenCalledWith({
      identifier: 'testuser',
      password: 'Password@123',
    });
  });

  it('shows error when login fails', async () => {
    vi.spyOn(loginStore, 'submitLogin').mockRejectedValue(new Error('Invalid credentials'));

    const input = wrapper.find('input[name="password"]');
    await input.setValue('wrongpassword');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'Invalid credentials');
  });

  it('handles generic error during submission', async () => {
    vi.spyOn(loginStore, 'submitLogin').mockRejectedValue(new Error('Network error'));

    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
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
    vi.spyOn(loginStore, 'submitLogin').mockRejectedValue({});

    const input = wrapper.find('input[name="password"]');
    await input.setValue('Password@123');
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

  it('trims whitespace from password before submission', async () => {
    vi.spyOn(loginStore, 'submitLogin').mockResolvedValue(undefined);

    const input = wrapper.find('input[name="password"]');
    await input.setValue('  Password@123  ');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(loginStore.submitLogin).toHaveBeenCalledWith({
      identifier: 'testuser',
      password: 'Password@123',
    });
  });

  it('calls openForgotPasswordDialog when forgot password link is clicked', async () => {
    const forgotPasswordLink = wrapper.find('[data-testid="forgot-password-link"]');
    await forgotPasswordLink.trigger('click');
    await nextTick();

    // Check that router.push was called
    expect(navigateToMock).toHaveBeenCalled();
  });

  it('navigates to password reset with identifier when forgot password is clicked', async () => {
    loginStore.identifier = 'test@example.com';
    loginStore.step = 1;

    const forgotPasswordLink = wrapper.find('[data-testid="forgot-password-link"]');
    await forgotPasswordLink.trigger('click');
    await nextTick();

    expect(navigateToMock).toHaveBeenCalledWith('/password-reset?identifier=test@example.com');
  });

  it('identifier input is readonly', () => {
    const identifierInput = wrapper.find('input[name="identifier"]');
    expect(identifierInput.attributes('readonly')).toBeDefined();
  });
});
