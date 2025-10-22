import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import * as toaster from '@/utils/showToaster';
import { h } from 'vue';
import IdentifierStep from '@/components/auth/login/IdentifierStep.vue';
import UiDialog from '@/components/ui/dialog/Dialog.vue';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      errors: {
        IDENTIFIER_REQUIRED: 'Identifier is required',
        USER_NOT_FOUND: 'User not found',
      },
    },
  },
});

describe('AuthLoginIdentifierStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    vi.useFakeTimers(); // Enable fake timers
    document.body.innerHTML = '';

    vi.spyOn(toaster, 'showToaster');
  });

  afterEach(() => {
    vi.useRealTimers(); // Reset timers
  });

  it('renders input and buttons', async () => {
    const wrapper = await mountSuspended(
      {
        render() {
          return h(UiDialog, null, { default: () => h(IdentifierStep) });
        },
      },
      { global: { plugins: [i18n] } },
    );

    expect(wrapper.find('input[name="identifier"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="forgot-password-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="google-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="github-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="signup-link"]').exists()).toBe(true);
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it(
    'shows error when identifier is empty',
    async () => {
      const wrapper = await mountSuspended(
        {
          render() {
            return h(UiDialog, null, { default: () => h(IdentifierStep) });
          },
        },
        { global: { plugins: [i18n] } },
      );

      const form = wrapper.find('form');
      await form.trigger('submit');
      await vi.runAllTimersAsync();

      expect(toaster.showToaster).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Identifier is required'),
      );
    },
    { timeout: 10000 },
  );

  //  it('shows error when identifier not found', async () => {
  //   // Mock before importing the component
  //   const store = reactive({
  //     checkIdentifierExists: vi.fn().mockResolvedValue(false),
  //   });

  //    vi.doMock('@/stores/auth/login', () => ({
  //      useLoginStore: () => store,
  //    }));

  //   // Now import the component (after the mock)
  //   const { default: IdentifierStep } = await import('@/components/auth/login/IdentifierStep.vue');

  //   const wrapper = await mountSuspended({
  //     render() {
  //       return h(UiDialog, null, { default: () => h(IdentifierStep) });
  //     },
  //   }, { global: { plugins: [i18n] } });

  //   const identifierInput = wrapper.find('input[name="identifier"]');
  //   await identifierInput.setValue('unknown_user');
  //   await nextTick();

  //   const form = wrapper.find('form');
  //   await form.trigger('submit');
  //   await vi.runAllTimersAsync();

  //   expect(toaster.showToaster).toHaveBeenCalledWith(
  //     'error',
  //     expect.stringContaining('User not found')
  //   );
  // });
});
