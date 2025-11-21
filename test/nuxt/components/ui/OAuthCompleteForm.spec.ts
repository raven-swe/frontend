import { mount } from '@vue/test-utils';
import OAuthCompleteForm from '@/components/ui/OAuthCompleteForm.vue';
import { vi, it, describe, beforeEach, expect } from 'vitest';
import { createI18n } from 'vue-i18n';
import { ref, type ComponentPublicInstance } from 'vue';

let submitMock: ReturnType<typeof vi.fn>;

const navigateToMock = vi.fn();
vi.stubGlobal('navigateTo', navigateToMock);

vi.mock('~/composables/useOAuthComplete', () => ({
  useOAuthComplete: () => ({
    loading: ref(false),
    submit: submitMock,
  }),
}));

vi.mock('@/composables/useDateSelect', () => ({
  default: vi.fn(() => ({
    selectedDay: ref(''),
    selectedMonth: ref(''),
    selectedYear: ref(''),
    days: ref(['1', '2', '3']),
    months: ref(['1', '2', '3']),
    years: ref(['2000', '2001', '2002']),
  })),
}));

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: {
    en: {
      'register.register-info.title': 'Register Info',
      'register.register-info.date-of-birth.title': 'Date of Birth',
      'register.register-info.date-of-birth.description': 'desc',
      'errors.AGE_RESTRICTION': 'Too young',
      'ui.next': 'Next',
    },
  },
});

describe('OAuthCompleteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitMock = vi.fn();
  });

  it('renders dialog and form fields', () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div data-test-id="oauth-complete-dialog"><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
            props: ['modelValue', 'options', 'placeholder', 'name', 'class'],
          },
          Button: {
            template: '<button :disabled="disabled"><slot /></button>',
            props: ['disabled', 'size', 'class'],
          },
        },
      },
    });

    expect(wrapper.html()).toContain('Register Info');
    expect(wrapper.html()).toContain('Date of Birth');
    expect(wrapper.find('[data-test-id="oauth-complete-dialog"]').exists()).toBe(true);
  });

  it('disables button if no birthDate', () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button :disabled="disabled"><slot /></button>',
            props: ['disabled', 'size', 'class'],
          },
        },
      },
    });

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('shows error if under 13 years', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      dateSelect: {
        selectedDay: { value: string };
        selectedMonth: { value: string };
        selectedYear: { value: string };
      };
    };
    const today = new Date();
    const recentYear = today.getFullYear() - 10;

    vm.dateSelect.selectedDay.value = '15';
    vm.dateSelect.selectedMonth.value = '6';
    vm.dateSelect.selectedYear.value = recentYear.toString();

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-test-id="birth-date-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="birth-date-error"]').text()).toBe('Too young');
  });

  it('calls submit with correct values', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['disabled', 'size', 'class'],
            emits: ['click'],
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      dateSelect: {
        selectedDay: { value: string };
        selectedMonth: { value: string };
        selectedYear: { value: string };
      };
    };
    vm.dateSelect.selectedDay.value = '1';
    vm.dateSelect.selectedMonth.value = '1';
    vm.dateSelect.selectedYear.value = '2000';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    await button.trigger('click');

    expect(submitMock).toHaveBeenCalledWith('token123', '2000-01-01');
  });

  it('sets openDialog to true initially', () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            name: 'UiDialog',
            template: '<div data-test-id="ui-dialog"><slot /></div>',
            props: ['open'],
            emits: ['update:open'],
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & { openDialog: boolean };
    expect(vm.openDialog).toBe(true);
  });

  it('clears birthDate error when valid date is selected after invalid', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      dateSelect: {
        selectedDay: { value: string };
        selectedMonth: { value: string };
        selectedYear: { value: string };
      };
    };

    const today = new Date();
    const recentYear = today.getFullYear() - 10;
    vm.dateSelect.selectedDay.value = '15';
    vm.dateSelect.selectedMonth.value = '6';
    vm.dateSelect.selectedYear.value = recentYear.toString();

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-test-id="birth-date-error"]').exists()).toBe(true);

    vm.dateSelect.selectedDay.value = '1';
    vm.dateSelect.selectedMonth.value = '1';
    vm.dateSelect.selectedYear.value = '2000';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-test-id="birth-date-error"]').exists()).toBe(false);
  });

  it('handles invalid date selection (e.g., Feb 31)', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button :disabled="disabled"><slot /></button>',
            props: ['disabled', 'size', 'class'],
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      dateSelect: {
        selectedDay: { value: string };
        selectedMonth: { value: string };
        selectedYear: { value: string };
      };
      birthDate: string;
    };

    vm.dateSelect.selectedDay.value = '31';
    vm.dateSelect.selectedMonth.value = '2';
    vm.dateSelect.selectedYear.value = '2000';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(vm.birthDate).toBe('');
  });

  it('clears birthDate when incomplete date is selected', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'token123' },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialog: {
            template: '<div><slot /></div>',
          },
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          UiDialogHeader: {
            template: '<div><slot /></div>',
          },
          UiDialogTitle: {
            template: '<div><slot /></div>',
          },
          UiDialogFooter: {
            template: '<div><slot /></div>',
          },
          Select: {
            template: '<select><slot /></select>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
        },
      },
    });

    const vm = wrapper.vm as unknown as ComponentPublicInstance & {
      dateSelect: {
        selectedDay: { value: string };
        selectedMonth: { value: string };
        selectedYear: { value: string };
      };
      birthDate: string;
    };

    vm.dateSelect.selectedDay.value = '15';
    vm.dateSelect.selectedMonth.value = '';
    vm.dateSelect.selectedYear.value = '2000';

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(vm.birthDate).toBe('');
  });
});
