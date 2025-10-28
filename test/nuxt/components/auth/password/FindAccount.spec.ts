import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import FindAccount from '@/components/auth/password/FindAccount.vue';
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
    currentRoute: {
      value: {
        query: {},
      },
    },
  });
});

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'errors.GENERIC_ERROR': 'An error occurred',
      'root.auth.find-your-account': 'Find your account',
      'root.auth.enter-identifier': 'Enter your email or username',
      'root.auth.email-or-username': 'Email or username',
      'ui.next': 'Next',
    },
  },
});

describe('FindAccount.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof FindAccount>>;
  let passwordStore: ReturnType<typeof usePasswordStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    passwordStore = usePasswordStore();
    vi.clearAllMocks();

    wrapper = mount(FindAccount, {
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
    expect(wrapper.find('[data-testid="identifier-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
  });

  it('submit button is disabled when form is invalid', async () => {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('enables submit button when identifier is entered', async () => {
    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
    await input.trigger('input');
    await input.trigger('blur');

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });

  it('successfully submits valid identifier', async () => {
    vi.spyOn(passwordStore, 'checkUserExists').mockResolvedValue(undefined);

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

    expect(passwordStore.checkUserExists).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      recaptchaToken: 'recaptchaToken',
    });
  });

  it('shows error when user is not found', async () => {
    vi.spyOn(passwordStore, 'checkUserExists').mockRejectedValue(new Error('User not found'));

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
    vi.spyOn(passwordStore, 'checkUserExists').mockRejectedValue(new Error('Network error'));

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
    vi.spyOn(passwordStore, 'checkUserExists').mockRejectedValue({});

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

  it('trims whitespace from identifier before submission', async () => {
    vi.spyOn(passwordStore, 'checkUserExists').mockResolvedValue(undefined);

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

    expect(passwordStore.checkUserExists).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      recaptchaToken: 'recaptchaToken',
    });
  });

  it('displays identifier from store when provided', async () => {
    passwordStore.identifier = 'existing@example.com';

    // Remount with identifier
    wrapper = mount(FindAccount, {
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

    await nextTick();

    const input = wrapper.find('input[name="identifier"]');
    expect((input.element as HTMLInputElement).value).toBe('existing@example.com');
  });
});
