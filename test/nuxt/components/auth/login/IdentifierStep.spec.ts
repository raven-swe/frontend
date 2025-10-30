import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import IdentifierStep from '@/components/auth/login/IdentifierStep.vue';
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
      'errors.IDENTIFIER_REQUIRED': 'Identifier is required',
      'errors.USER_NOT_FOUND': 'User not found',
      'errors.GENERIC_ERROR': 'An error occurred',
      'Sign in to Raven': 'Sign in to Raven',
      'root.auth.google-signin': 'Sign in with Google',
      'root.auth.github-signin': 'Sign in with GitHub',
      'root.auth.separator': 'or',
      'root.auth.email-or-username': 'Email or username',
      'ui.next': 'Next',
      'root.auth.forgot-password': 'Forgot password?',
      'root.auth.dont-have-account': "Don't have an account?",
      'root.auth.signup': 'Sign up',
    },
  },
});

describe('IdentifierStep.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof IdentifierStep>>;
  let loginStore: ReturnType<typeof useLoginStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    loginStore = useLoginStore();
    vi.clearAllMocks();

    wrapper = mount(IdentifierStep, {
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
          Icon: {
            template: '<span class="icon" />',
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
    expect(wrapper.find('[data-testid="identifier-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="forgot-password-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="google-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="github-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="signup-link"]').exists()).toBe(true);
  });

  it('submit button is disabled when form is invalid', async () => {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('successfully submits valid identifier', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(true);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(loginStore.checkUserExists).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error when user is not found', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(false);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('notfound@example.com');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(showToasterMock).toHaveBeenCalledWith('error', 'User not found');
  });

  it('handles generic error during submission', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockRejectedValue(new Error('Network error'));

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
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
    vi.spyOn(loginStore, 'checkUserExists').mockRejectedValue({});

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
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

  it('calls openForgotPasswordDialog when forgot password button is clicked', async () => {
    const forgotPasswordButton = wrapper.find('[data-testid="forgot-password-button"]');
    await forgotPasswordButton.trigger('click');
    await nextTick();

    // Check that router.push was called with the correct path
    expect(navigateToMock).toHaveBeenCalledWith('/password-reset');
  });

  it('trims whitespace from identifier before submission', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(true);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('  test@example.com  ');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(loginStore.checkUserExists).toHaveBeenCalledWith('test@example.com');
  });

  it('enables submit button when form is valid', async () => {
    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });
});
