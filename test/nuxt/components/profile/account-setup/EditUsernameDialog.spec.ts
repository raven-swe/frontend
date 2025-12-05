import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditUsernameDialog from '~/components/profile/account-setup/EditUsernameDialog.vue';

import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import { FetchError } from 'ofetch';
import type { ApiErrorResponse } from '#shared/types/api';
import { flushPromises } from '@vue/test-utils';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const accountServiceMock = vi.hoisted(() => {
  return {
    checkAccountExists: vi.fn(() => {
      return false;
    }),
  };
});

const userStoreMock = vi.hoisted(() => {
  return {
    user: {
      username: 'currentuser',
    },
  };
});

const settingsServiceMock = vi.hoisted(() => {
  return {
    getUsernameSuggestions: vi.fn((username: string) => {
      return {
        data: { suggestions: [`${username}123`, `${username}_official`, `the_${username}`] },
      };
    }),
  };
});

const userAccountSetupMock = vi.hoisted(() => {
  return {
    handleUsernameSubmit: vi.fn(),
    goToNextStep: vi.fn(),
  };
});

// Mock the composable
vi.mock('~/composables/useAccountSetup', () => ({
  default: () => userAccountSetupMock,
}));

vi.mock('~/services/auth/accountService', async () => {
  return {
    accountService: accountServiceMock,
  };
});

vi.mock('~/services/settingsService', async () => {
  return {
    settingsService: settingsServiceMock,
  };
});

vi.mock('~/stores/user', () => ({
  useUserStore: () => userStoreMock,
}));

// Debounce mock -> run immediately
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>();
  return {
    ...actual,
    useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn,
    useDebounce: (value: unknown) => value,
  };
});

describe('EditUsernameDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: "<div><slot /> <slot name='header'></slot></div>" },
          LogoRaven: { template: '<div data-test="logo-raven">LogoRaven</div>' },
        },
      },
    });
    expect(wrapper.text()).toContain('What Should we call you?');
    expect(wrapper.text()).toContain('Your @username is unique. You can change it later.');
    expect(wrapper.text()).toContain('Suggestions');
    // for the "currentuser" username
    expect(wrapper.text()).toContain('currentuser123');
    expect(wrapper.text()).toContain('currentuser_official');
    expect(wrapper.text()).toContain('the_currentuser');
    // LogoRaven stub
    expect(wrapper.find('[data-test="logo-raven"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('show username taken error', async () => {
    accountServiceMock.checkAccountExists.mockResolvedValue(true);

    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('takenusername');
    await nextTick();
    await flushPromises(); // ensure any promises inside the debounced validator resolve
    await new Promise((r) => setTimeout(r, 5)); // wait for DOM update
    expect(accountServiceMock.checkAccountExists).toHaveBeenCalledWith('takenusername');
    expect(wrapper.text()).toContain('That username has been taken. Please choose another.');
    wrapper.unmount();
  });

  it('handle backend throw ratelimit error on debounce check', async () => {
    const rateLimitError = new FetchError<FetchError<ApiErrorResponse>>('Rate limit exceeded');
    rateLimitError.data = {
      statusCode: 429,
      data: {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
        },
      },
      message: 'Rate limit exceeded',
      name: 'Rate limit exceeded',
    };
    accountServiceMock.checkAccountExists.mockRejectedValue(rateLimitError);

    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('errorusername');

    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await nextTick();

    expect(accountServiceMock.checkAccountExists).toHaveBeenCalledWith('errorusername');
    expect(wrapper.text()).toContain('errors.username.TOO_MANY_REQUESTS');
    wrapper.unmount();
  });

  it('handle backend throw error in general on debounce check', async () => {
    accountServiceMock.checkAccountExists.mockRejectedValue(new Error('Generic error'));

    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('errorusername');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await flushPromises(); // ensure any promises inside the debounced validator resolve

    expect(accountServiceMock.checkAccountExists).toHaveBeenCalledWith('errorusername');
    expect(wrapper.text()).toContain('errors.UNKNOWN_ERROR');
    wrapper.unmount();
  });

  it('submits valid username', async () => {
    userAccountSetupMock.handleUsernameSubmit.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('validusername');

    const form = wrapper.find('form');
    await form.trigger('submit');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await flushPromises();

    expect(userAccountSetupMock.handleUsernameSubmit).toHaveBeenCalledWith('validusername');
    wrapper.unmount();
  });

  it('handles backend validation errors on submit', async () => {
    userAccountSetupMock.handleUsernameSubmit.mockResolvedValue([
      {
        field: 'username',
        code: 'USERNAME_TAKEN',
      },
    ]);

    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('takenusername');

    const form = wrapper.find('form');
    await form.trigger('submit');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await flushPromises();

    expect(userAccountSetupMock.handleUsernameSubmit).toHaveBeenCalledWith('takenusername');
    expect(wrapper.text()).toContain('errors.username.USERNAME_TAKEN');
    wrapper.unmount();
  });

  it('skips step if username is empty', async () => {
    userAccountSetupMock.handleUsernameSubmit.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: '<div><slot /></div>' },
        },
      },
    });

    const input = wrapper.find('input[name="username"]');
    await input.setValue('');

    const submitBtn = wrapper.find('button[data-test="submit-button"]');
    await submitBtn.trigger('click');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await flushPromises();
    expect(userAccountSetupMock.handleUsernameSubmit).not.toHaveBeenCalled();
    expect(userAccountSetupMock.goToNextStep).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('clicking on suggestion sets input value', async () => {
    const wrapper = await mountSuspended(EditUsernameDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: { template: "<div><slot /> <slot name='header'></slot></div>" },
        },
      },
    });

    const firstSuggestion = wrapper.find('button[data-test="suggestion-button-0"]');
    expect(firstSuggestion.exists()).toBe(true);

    await firstSuggestion.trigger('click');
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 5)); // wait for DOM update
    await flushPromises();

    const input = wrapper.find('input[name="username"]');
    expect((input.element as HTMLInputElement).value).toBe(firstSuggestion.text());
    wrapper.unmount();
  });
});
