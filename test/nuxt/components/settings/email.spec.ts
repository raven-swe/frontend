import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, type Ref } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// ---- i18n mock: return key and allow switching locale if needed
const localeRef: Ref<string> = ref('en');
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: localeRef,
  });
});

// ---- Mock Pinia user store consumed by the page
type UserShape = { email?: string };
type MockUserStore = { user: UserShape | undefined };
let userStore: MockUserStore;
mockNuxtImport('useUserStore', () => {
  return () => userStore;
});

// ---- Mock change-email store (direct path import) to spy on handleDialogChange
const handleDialogChange = vi.fn();
vi.mock('~/stores/settings/change-email', () => ({
  useChangeEmailStore: () => ({ handleDialogChange }),
}));

/* eslint-disable import/first */
import EmailPage from '@/pages/settings/account/email.vue';
/* eslint-enable import/first */

// ---- Lightweight stubs for child and UI components
const ChangeEmailFormStub = { template: '<div data-testid="change-email-form" />' };
const OtpFormStub = { template: '<div data-testid="otp-form" />' };
const UiInputStub = {
  template:
    '<input data-testid="ui-input" :value="modelValue" :placeholder="placeholder" :disabled="disabled" />',
  props: ['modelValue', 'placeholder', 'disabled'],
};
const UiButtonStub = {
  template: '<button data-testid="ui-button" @click="$emit(\'click\')"><slot /></button>',
};
const NuxtLinkStub = {
  template: '<a data-testid="nuxt-link" :href="to"><slot /></a>',
  props: ['to'],
};
const IconStub = { template: '<i data-testid="icon" />' };

describe('Settings Email Page', () => {
  beforeEach(() => {
    localeRef.value = 'en';
    userStore = { user: { email: 'user@example.com' } } as MockUserStore;
    handleDialogChange.mockClear();
  });

  it('renders title, back link, and shows current email in a disabled input', async () => {
    const wrapper = await mountSuspended(EmailPage, {
      global: {
        stubs: {
          ChangeEmailForm: ChangeEmailFormStub,
          OtpForm: OtpFormStub,
          UiInput: UiInputStub,
          UiButton: UiButtonStub,
          NuxtLink: NuxtLinkStub,
          Icon: IconStub,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    // Title text via i18n
    expect(wrapper.text()).toContain('setting.change-email.title');

    // Back link points to account settings
    const link = wrapper.get('[data-testid="nuxt-link"]');
    expect(link.attributes('href')).toBe('/settings/account');

    // Input shows current email and is disabled
    const input = wrapper.get('[data-testid="ui-input"]');
    expect(input.attributes('value')).toBe('user@example.com');
    expect(input.attributes('disabled')).toBeDefined();

    // Child forms are rendered
    expect(wrapper.find('[data-testid="change-email-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="otp-form"]').exists()).toBe(true);
  });

  it('clicking the change email button calls handleDialogChange(true)', async () => {
    const wrapper = await mountSuspended(EmailPage, {
      global: {
        stubs: {
          ChangeEmailForm: ChangeEmailFormStub,
          OtpForm: OtpFormStub,
          UiInput: UiInputStub,
          UiButton: UiButtonStub,
          NuxtLink: NuxtLinkStub,
          Icon: IconStub,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    const btn = wrapper.get('[data-testid="ui-button"]');
    await btn.trigger('click');
    // Ensure the store handler was called with `true` at least once
    expect(handleDialogChange).toHaveBeenCalled();
    expect(handleDialogChange).toHaveBeenCalledWith(true);
    // Button label uses i18n key
    expect(btn.text()).toContain('setting.change-email.title');
  });
});
