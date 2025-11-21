import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// Mocks must be declared before importing the component

// Capture mutable values passed to onSubmit via mocked handleSubmit
type FormValues = { currentPassword: string; newPassword: string; confirmPassword?: string };

// Use hoisted containers to avoid TDZ with vi.mock factories
const routerHoisted = vi.hoisted(() => ({ pushMock: vi.fn() }));
const apiHoisted = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));
const veeHoisted = vi.hoisted(() => ({
  setFieldErrorMock: vi.fn(),
  submitValues: undefined as FormValues | undefined,
}));

// Control i18n t() implementation per-test
const i18nHoisted = vi.hoisted(() => ({ tImpl: (k: string) => k }));

// Mock vue-router useRouter
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerHoisted.pushMock }),
}));

// Mock Nuxt auto-imported useI18n to avoid requiring the plugin installation
mockNuxtImport('useI18n', () => {
  return () => ({ t: (k: string) => i18nHoisted.tImpl(k), locale: { value: 'en' } });
});

// Note: we intentionally do not mock useNuxtApp – test-utils provides a proper instance

// Mock API module
vi.mock('~/api', () => ({
  apiFetch: apiHoisted.apiFetchMock,
}));

// Mock vee-validate to control submission and capture setFieldError calls
vi.mock('vee-validate', () => ({
  useForm: () => ({
    errors: {},
    isSubmitting: false,
    // Return minimal [value, attrs]; value is unused by our stubs
    defineField: () => [undefined, {}],
    // handleSubmit returns a function used as form submit handler;
    // call the provided submit fn with our controlled submitValues
    handleSubmit: (fn: (vals: FormValues) => Promise<void> | void) => {
      return async () => {
        if (veeHoisted.submitValues) {
          await fn(veeHoisted.submitValues);
        }
      };
    },
    setFieldError: veeHoisted.setFieldErrorMock,
  }),
}));

// Import after mocks
/* eslint-disable import/first */
import ChangePasswordEditor from '@/pages/settings/changePasswordEditor.vue';
/* eslint-enable import/first */

// Lightweight stubs to avoid deep mounting
const stubFieldInput = {
  template: '<div class="field"><slot /></div>',
  props: ['name', 'type', 'placeholder'],
};
const stubButton = {
  template: '<button class="btn"><slot /></button>',
  props: ['type', 'disabled', 'variant', 'size', 'class'],
};
const stubIcon = {
  template: '<button class="icon" @click="$emit(\'click\')"></button>',
  props: ['name', 'size', 'to', 'class'],
};
const stubNuxtLink = {
  template: '<a class="link" :href="to"><slot /></a>',
  props: ['to', 'class'],
};

const flush = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('Settings ChangePasswordEditor Page', () => {
  beforeEach(() => {
    routerHoisted.pushMock.mockReset();
    apiHoisted.apiFetchMock.mockReset();
    veeHoisted.setFieldErrorMock.mockReset();
    veeHoisted.submitValues = undefined;
    i18nHoisted.tImpl = (k: string) => k;
  });

  it('submits successfully and navigates to account page', async () => {
    apiHoisted.apiFetchMock.mockResolvedValue({});
    veeHoisted.submitValues = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    };

    const wrapper = await mountSuspended(ChangePasswordEditor, {
      global: {
        stubs: {
          FieldInput: stubFieldInput,
          Button: stubButton,
          Icon: stubIcon,
          NuxtLink: stubNuxtLink,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    // Trigger form submit
    await wrapper.find('form').trigger('submit');
    await flush();

    expect(apiHoisted.apiFetchMock).toHaveBeenCalledTimes(1);
    expect(apiHoisted.apiFetchMock).toHaveBeenCalledWith('/api/settings/password', {
      method: 'PUT',
      query: {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      },
    });
    expect(routerHoisted.pushMock).toHaveBeenCalledWith('/settings/account');
  });

  it('sets field error for known status code errors', async () => {
    apiHoisted.apiFetchMock.mockRejectedValue({ statusCode: 401 });
    veeHoisted.submitValues = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    };

    const wrapper = await mountSuspended(ChangePasswordEditor, {
      global: {
        stubs: {
          FieldInput: stubFieldInput,
          Button: stubButton,
          Icon: stubIcon,
          NuxtLink: stubNuxtLink,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await wrapper.find('form').trigger('submit');
    await flush();

    expect(veeHoisted.setFieldErrorMock).toHaveBeenCalledWith(
      'currentPassword',
      'setting.password.errors.401',
    );
    expect(routerHoisted.pushMock).not.toHaveBeenCalled();
  });

  it('falls back to default error message when specific status key is missing', async () => {
    // Simulate API returning a status code with missing translation
    apiHoisted.apiFetchMock.mockRejectedValue({ statusCode: 500 });
    veeHoisted.submitValues = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    };

    // Make i18n return empty for numeric status keys to force the `||` fallback
    i18nHoisted.tImpl = (k: string) =>
      k.startsWith('setting.password.errors.') && /\d+$/.test(k) ? '' : k;

    const wrapper = await mountSuspended(ChangePasswordEditor, {
      global: {
        stubs: {
          FieldInput: stubFieldInput,
          Button: stubButton,
          Icon: stubIcon,
          NuxtLink: stubNuxtLink,
        },
        mocks: { $t: (k: string) => i18nHoisted.tImpl(k) },
      },
    });

    await wrapper.find('form').trigger('submit');
    await flush();

    // Should use the fallback error-saving key
    expect(veeHoisted.setFieldErrorMock).toHaveBeenCalledWith(
      'currentPassword',
      'setting.password.errors.error-saving',
    );
    expect(routerHoisted.pushMock).not.toHaveBeenCalled();
  });

  it('sets default error message when error has no status code', async () => {
    apiHoisted.apiFetchMock.mockRejectedValue(new Error('unknown'));
    veeHoisted.submitValues = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    };

    const wrapper = await mountSuspended(ChangePasswordEditor, {
      global: {
        stubs: {
          FieldInput: stubFieldInput,
          Button: stubButton,
          Icon: stubIcon,
          NuxtLink: stubNuxtLink,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    await wrapper.find('form').trigger('submit');
    await flush();

    expect(veeHoisted.setFieldErrorMock).toHaveBeenCalledWith(
      'currentPassword',
      'setting.password.errors.error-saving',
    );
    expect(routerHoisted.pushMock).not.toHaveBeenCalled();
  });

  it('navigates back when clicking the header icon', async () => {
    apiHoisted.apiFetchMock.mockResolvedValue({});

    const wrapper = await mountSuspended(ChangePasswordEditor, {
      global: {
        stubs: {
          FieldInput: stubFieldInput,
          Button: stubButton,
          Icon: stubIcon,
          NuxtLink: stubNuxtLink,
        },
        mocks: { $t: (k: string) => k },
      },
    });

    const iconEl = wrapper.find('.cursor-pointer');
    await iconEl.trigger('click');
    expect(routerHoisted.pushMock).toHaveBeenCalledWith('/settings/account');
  });
});
