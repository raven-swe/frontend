import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// i18n mock - Auto-import
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (k: string) => k,
    locale: ref('en'),
  });
});

// Router mock - Auto-import
const pushSpy = vi.fn();
const replaceSpy = vi.fn();
const backSpy = vi.fn();
mockNuxtImport('useRouter', () => {
  return () => ({ push: pushSpy, replace: replaceSpy, back: backSpy });
});

// User store mock - Auto-import
let userStoreData: { user: { email?: string } };
mockNuxtImport('useUserStore', () => {
  return () => userStoreData;
});

// change-email store mock - EXPLICIT IMPORT in component, so use vi.mock
const handleDialogChangeSpy = vi.fn();
vi.mock('~/stores/settings/change-email', () => ({
  useChangeEmailStore: () => ({ handleDialogChange: handleDialogChangeSpy }),
}));

// Component stubs
const ChangeEmailFormStub = { template: '<div data-testid="change-email-form" />' };
const OtpFormStub = { template: '<div data-testid="otp-form" />' };
const UiInputStub = {
  template: '<input data-testid="ui-input" :value="modelValue" :disabled="disabled" />',
  props: ['modelValue', 'disabled'],
};
const UiButtonStub = {
  template: '<button data-testid="ui-button" @click="$emit(\'click\')"><slot /></button>',
};
// IconStub matching Username.spec.ts but we might rely on NuxtIcon/Icon behavior or strict stubbing
const IconStub = {
  name: 'Icon',
  template: '<i data-testid="icon" @click="$emit(\'click\')" />',
  // If use .iconify, we assume the real component or a specific behavior.
  // Username.spec.ts used:
  // const IconStub = { name: 'Icon', template: '<i data-testid="icon" @click="$emit(\'click\')" />', props: ['name', 'size', 'to'], emits: ['click'] };
  // But asserted: wrapper.find('.iconify');
  // Wait, if Stub is used, it renders <i>. <i> does not have .iconify unless we put it there.
  // In Username.spec.ts output log (or if we checked it), if it finds .iconify, it means the Stub was NOT used or the Stub has that class.
  // The log from Username.spec.ts failure (if any) or success would tell.
  // BUT the log I saw for email.spec.ts (Step 682) showed: <span class="iconify ..."></span>
  // That means `Icon` was NOT stubbed with `IconStub` effectively, or `Icon` is Global and not easily stubbed by `stubs: { Icon: IconStub }`?
  // Actually, standard `stubs` in `mountSuspended` should work.
  // Let's copy Username.spec.ts Stub EXACTLY and assertions EXACTLY.
  props: ['name', 'size'],
  emits: ['click'],
};

/* eslint-disable import/first */
import EmailPage from '@/pages/settings/account/email.vue';
/* eslint-enable import/first */

describe('Settings Email Page', () => {
  beforeEach(() => {
    userStoreData = { user: { email: 'user@example.com' } };
    pushSpy.mockReset();
    replaceSpy.mockReset();
    backSpy.mockReset();
    handleDialogChangeSpy.mockReset();
  });

  it('renders title, back icon, and shows current email in a disabled input', async () => {
    const wrapper = await mountSuspended(EmailPage, {
      global: {
        mocks: {
          $t: (k: string) => k,
        },
        stubs: {
          ChangeEmailForm: ChangeEmailFormStub,
          OtpForm: OtpFormStub,
          UiInput: UiInputStub,
          UiButton: UiButtonStub,
          // Icon: IconStub, // Let's TRY WITHOUT STUBBING Icon first if we want to match previous behavior where it rendered .iconify?
          // OR stub it and expect the stub.
          // Username.spec.ts HAS stubs: { Icon: IconStub }.
          // AND it looks for .iconify.
          // If Stub is used, it renders <i data-testid="icon" ...>.
          // So if Username.spec.ts finds .iconify, DOES IT?
          // Line 192: const icon = wrapper.find('.iconify');
          // If that works, then the Stub is NOT being used or valid, or the Stub has class iconify?
          // The Stub in Username.spec.ts: template: '<i data-testid="icon" @click="$emit(\'click\')" />'
          // It does NOT have class iconify.
          // This implies Username.spec.ts might be finding the REAL Icon if stubbing failed, or I am misreading.
          // OR `Icon` global component is `NuxtIcon`?

          // Let's use the Stub and look for data-testid="icon" which is safer if stubbing works.
          Icon: IconStub,
        },
      },
    });

    // Verify title
    expect(wrapper.text()).toContain('setting.change-email.title');

    // Verify Icon and navigation
    // Try data-testid first as it matches the Stub we provided.
    const icon = wrapper.find('[data-testid="icon"]');
    if (icon.exists()) {
      await icon.trigger('click');
      expect(backSpy).toHaveBeenCalled();
    } else {
      // If stub didn't work, maybe it rendered .iconify (real component)
      const iconify = wrapper.find('.iconify');
      expect(iconify.exists()).toBe(true);
      await iconify.trigger('click');
      expect(backSpy).toHaveBeenCalled();
    }

    // Input shows current email and is disabled
    const input = wrapper.find('[data-testid="ui-input"]');
    expect(input.attributes('value')).toBe('user@example.com');
    expect(input.attributes('disabled')).toBeDefined();

    // Child forms rendered
    expect(wrapper.find('[data-testid="change-email-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="otp-form"]').exists()).toBe(true);
  });

  it('clicking the change email button calls handleDialogChange(true)', async () => {
    const wrapper = await mountSuspended(EmailPage, {
      global: {
        mocks: {
          $t: (k: string) => k,
        },
        stubs: {
          ChangeEmailForm: ChangeEmailFormStub,
          OtpForm: OtpFormStub,
          UiInput: UiInputStub,
          UiButton: UiButtonStub,
          Icon: IconStub,
        },
      },
    });

    const button = wrapper.find('[data-testid="ui-button"]');
    await button.trigger('click');
    expect(handleDialogChangeSpy).toHaveBeenCalledWith(true);
    expect(button.text()).toContain('setting.change-email.title');
  });
});
