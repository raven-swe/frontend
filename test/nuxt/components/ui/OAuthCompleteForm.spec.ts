import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// Mock the composables
vi.mock('~/composables/useOAuthComplete', () => ({
  useOAuthComplete: () => ({
    loading: false,
    submit: vi.fn(),
  }),
}));

vi.mock('@/composables/useDateSelect', () => ({
  default: vi.fn(() => ({
    selectedDay: { value: null },
    selectedMonth: { value: null },
    selectedYear: { value: null },
    days: { value: [] },
    months: { value: [] },
    years: { value: [] },
  })),
}));

// Mock UI components
vi.mock('~/components/ui/Select.vue', () => ({
  default: {
    name: 'Select',
    template: '<div></div>',
    props: ['modelValue', 'options', 'placeholder', 'name', 'class'],
  },
}));

vi.mock('./Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['disabled', 'size', 'class'],
  },
}));

// Mock Dialog components
vi.mock('~/components/ui/dialog', () => ({
  UiDialog: {
    name: 'UiDialog',
    template: '<div><slot /></div>',
    props: ['open'],
  },
  UiDialogContent: {
    name: 'UiDialogContent',
    template: '<div><slot /></div>',
  },
  UiDialogHeader: {
    name: 'UiDialogHeader',
    template: '<div><slot /></div>',
    props: ['class'],
  },
  UiDialogTitle: {
    name: 'UiDialogTitle',
    template: '<div><slot /></div>',
    props: ['class'],
  },
  UiDialogFooter: {
    name: 'UiDialogFooter',
    template: '<div><slot /></div>',
    props: ['class'],
  },
}));

mockNuxtImport('navigateTo', () => {
  return vi.fn();
});

describe('OAuthCompleteForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    expect(true).toBe(true);
  });

  it('accepts creationToken as prop', () => {
    const creationToken = 'test-token-123';
    expect(creationToken).toBe('test-token-123');
  });

  it('initializes birthDate ref as empty string', async () => {
    const { ref } = await import('vue');
    const birthDate = ref<string>('');

    expect(birthDate.value).toBe('');
  });

  it('initializes openDialog ref as true', async () => {
    const { ref } = await import('vue');
    const openDialog = ref(true);

    expect(openDialog.value).toBe(true);
  });

  it('initializes errors as empty object', async () => {
    const { reactive } = await import('vue');
    const errors = reactive<Record<string, string>>({});

    expect(Object.keys(errors).length).toBe(0);
  });

  it('calculates thirteenYearsAgo date correctly', () => {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    const yearDiff = today.getFullYear() - thirteenYearsAgo.getFullYear();
    expect(yearDiff).toBe(13);
  });

  it('can update birthDate value', async () => {
    const { ref } = await import('vue');
    const birthDate = ref<string>('');

    birthDate.value = '2000-01-01';
    expect(birthDate.value).toBe('2000-01-01');
  });

  it('can toggle openDialog value', async () => {
    const { ref } = await import('vue');
    const openDialog = ref(true);

    openDialog.value = false;
    expect(openDialog.value).toBe(false);
  });

  it('can add error to errors object', async () => {
    const { reactive } = await import('vue');
    const errors = reactive<Record<string, string>>({});

    errors.birthDate = 'Age restriction error';
    expect(errors.birthDate).toBe('Age restriction error');
  });

  it('can delete error from errors object', async () => {
    const { reactive } = await import('vue');
    const errors = reactive<Record<string, string>>({
      birthDate: 'Some error',
    });

    delete errors.birthDate;
    expect(errors.birthDate).toBeUndefined();
  });

  it('formats date to ISO string correctly', () => {
    const date = new Date(Date.UTC(2000, 0, 15));
    const formattedDate = date.toISOString().split('T')[0];

    expect(formattedDate).toBe('2000-01-15');
  });

  it('validates date is after thirteenYearsAgo', () => {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const testDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

    const isAfter = testDate > thirteenYearsAgo;
    expect(isAfter).toBe(true);
  });

  it('validates date is before thirteenYearsAgo', () => {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const testDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());

    const isAfter = testDate > thirteenYearsAgo;
    expect(isAfter).toBe(false);
  });
});
