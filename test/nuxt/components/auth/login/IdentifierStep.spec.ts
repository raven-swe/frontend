import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper, flushPromises } from '@vue/test-utils';
import messages from '@@/i18n/locales/en.json';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import IdentifierStep from '@/components/auth/login/IdentifierStep.vue';
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
    await new Promise((resolve) => setTimeout(resolve, 10));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(true);
  });

  it('successfully submits valid identifier', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(true);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(loginStore.checkUserExists).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error when user is not found', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(false);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('notfound@example.com');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const errorMessage = wrapper.find('[data-test-id="identifier-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toContain('User not found');
  });

  it('handles validation errors from backend (422)', async () => {
    const validationErrors = [{ field: 'identifier', code: 'INVALID_FORMAT' }];
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(
      validationErrors as unknown as boolean,
    );

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('invalid-identifier');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const errorMessage = wrapper.find('[data-test-id="identifier-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Please enter a valid email or username');
  });

  it('handles multiple validation errors from backend', async () => {
    const validationErrors = [{ field: 'identifier', code: 'TOO_SHORT' }];
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(
      validationErrors as unknown as boolean,
    );

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('ab');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const errorMessage = wrapper.find('[data-test-id="identifier-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Identifier is too short');
  });

  it('calls openForgotPasswordDialog when forgot password button is clicked', async () => {
    const forgotPasswordButton = wrapper.find('[data-testid="forgot-password-button"]');
    await forgotPasswordButton.trigger('click');
    await flushPromises();

    expect(navigateToMock).toHaveBeenCalledWith('/password-reset');
  });

  it('trims whitespace from identifier before submission', async () => {
    vi.spyOn(loginStore, 'checkUserExists').mockResolvedValue(true);

    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('  test@example.com  ');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(loginStore.checkUserExists).toHaveBeenCalledWith('test@example.com');
  });

  it('enables submit button when form is valid', async () => {
    const input = wrapper.find('input[name="identifier"]');
    await input.setValue('test@example.com');
    await input.trigger('input');
    await input.trigger('blur');
    await new Promise((resolve) => setTimeout(resolve, 20));

    const submitButton = wrapper.find('[data-testid="submit-button"]');
    expect(submitButton.element.hasAttribute('disabled')).toBe(false);
  });
});
