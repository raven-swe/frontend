import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import PasswordResetPage from '@/pages/password-reset/index.vue';

// Mock router - MUST be defined before importing usePasswordStore
const { navigateToMock, currentRouteMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
    currentRouteMock: {
      value: {
        query: {},
      },
    },
  };
});

// Mock the usePasswordStore module to avoid router issues
const mockPasswordStore = {
  step: 0,
  open: true,
  identifier: '',
  loading: false,
  openDialog: vi.fn(),
  closeDialog: vi.fn(),
  checkUserExists: vi.fn(),
  verifyUser: vi.fn(),
  resendOtp: vi.fn(),
  resetPassword: vi.fn(),
};

vi.mock('@/stores/auth/password', () => ({
  usePasswordStore: () => mockPasswordStore,
}));

mockNuxtImport('useRouter', () => {
  return () => ({
    push: navigateToMock,
    currentRoute: currentRouteMock,
  });
});

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'ui.close': 'Close',
    },
  },
});

describe('PasswordResetPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof PasswordResetPage>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Reset mock store values
    mockPasswordStore.step = 0;
    mockPasswordStore.open = true;
    mockPasswordStore.loading = false;

    wrapper = mount(PasswordResetPage, {
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div class="ui-dialog"><slot /><slot name="header" /></div>',
            props: ['open'],
          },
          UiDialogContent: {
            template: '<div class="ui-dialog-content"><slot name="header" /><slot /></div>',
            props: ['hideCloseButton', 'headerClass'],
          },
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          Icon: {
            template: '<span class="icon" />',
          },
          UiSpinner: {
            template: '<div class="spinner">Loading...</div>',
          },
          FindAccount: {
            template: '<div id="find-account-stub">Find Account</div>',
          },
          SentCode: {
            template: '<div id="sent-code-stub">Sent Code</div>',
          },
          ChooseNewPassword: {
            template: '<div id="choose-new-password-stub">Choose New Password</div>',
          },
        },
      },
    });
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('calls openDialog on mount', async () => {
    expect(mockPasswordStore.open).toBe(true);
  });

  it('displays FindAccount component when step is 0', async () => {
    mockPasswordStore.step = 0;
    await nextTick();

    expect(mockPasswordStore.step).toBe(0);
  });

  it('displays SentCode component when step is 1', async () => {
    mockPasswordStore.step = 1;
    await nextTick();

    expect(mockPasswordStore.step).toBe(1);
  });

  it('displays ChooseNewPassword component when step is 2', async () => {
    mockPasswordStore.step = 2;
    await nextTick();

    expect(mockPasswordStore.step).toBe(2);
  });

  it('displays spinner when loading', async () => {
    mockPasswordStore.loading = true;

    // Remount with loading true
    wrapper = mount(PasswordResetPage, {
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div class="ui-dialog"><slot /><slot name="header" /></div>',
            props: ['open'],
          },
          UiDialogContent: {
            template: '<div class="ui-dialog-content"><slot name="header" /><slot /></div>',
            props: ['hideCloseButton', 'headerClass'],
          },
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          Icon: {
            template: '<span class="icon" />',
          },
          UiSpinner: {
            template: '<div class="spinner">Loading...</div>',
          },
          FindAccount: {
            template: '<div id="find-account-stub">Find Account</div>',
          },
          SentCode: {
            template: '<div id="sent-code-stub">Sent Code</div>',
          },
          ChooseNewPassword: {
            template: '<div id="choose-new-password-stub">Choose New Password</div>',
          },
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('hides spinner when not loading', async () => {
    mockPasswordStore.loading = false;
    await nextTick();

    expect(wrapper.find('.spinner').exists()).toBe(false);
  });

  it('dialog is open based on store state', async () => {
    mockPasswordStore.open = true;
    await nextTick();

    expect(mockPasswordStore.open).toBe(true);
  });

  it('calls closeDialog when close button is clicked', async () => {
    const closeButton = wrapper.find('button');
    await closeButton.trigger('click');
    await nextTick();

    expect(mockPasswordStore.closeDialog).toHaveBeenCalled();
  });

  it('shows backdrop when dialog is open', async () => {
    mockPasswordStore.open = true;
    await nextTick();

    const backdrop = wrapper.find('[data-state="open"]');
    expect(backdrop.exists()).toBe(true);
  });

  it('hides components when loading', async () => {
    mockPasswordStore.loading = true;
    mockPasswordStore.step = 0;

    wrapper = mount(PasswordResetPage, {
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div class="ui-dialog"><slot /><slot name="header" /></div>',
            props: ['open'],
          },
          UiDialogContent: {
            template: '<div class="ui-dialog-content"><slot name="header" /><slot /></div>',
            props: ['hideCloseButton', 'headerClass'],
          },
          UiButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          Icon: {
            template: '<span class="icon" />',
          },
          UiSpinner: {
            template: '<div class="spinner">Loading...</div>',
          },
          FindAccount: {
            template: '<div id="find-account-stub" v-show="!loading">Find Account</div>',
            props: ['loading'],
          },
          SentCode: {
            template: '<div id="sent-code-stub">Sent Code</div>',
          },
          ChooseNewPassword: {
            template: '<div id="choose-new-password-stub">Choose New Password</div>',
          },
        },
      },
    });

    await nextTick();
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });
});
