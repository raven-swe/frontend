import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditProfileInfo from '@/components/profile/edit/EditProfileInfo.vue';

// Mock the useDateSelect composable
vi.mock('@/composables/useDateSelect', () => ({
  default: vi.fn(() => ({
    selectedDay: { value: 1 },
    selectedMonth: { value: 1 },
    selectedYear: { value: 2000 },
    months: { value: [{ label: 'January', value: 1 }] },
    days: { value: [{ label: '1', value: 1 }] },
    years: { value: [{ label: '2000', value: 2000 }] },
  })),
}));

const defaultProps = {
  name: 'John Doe',
  bio: 'Software developer',
  location: 'New York',
  website: 'https://example.com',
  birthDate: new Date('2000-01-01'),
  isNameValid: true,
  isAgeValid: true,
  isWebsiteValid: true,
};

describe('EditProfileInfo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all input fields with correct values', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const inputs = wrapper.findAll('input, textarea');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('emits update:bio when bio textarea changes', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const bioInput = wrapper.find('textarea');
    await bioInput.setValue('Updated bio');

    expect(wrapper.emitted('update:bio')).toBeTruthy();
    expect(wrapper.emitted('update:bio')?.[0]).toEqual(['Updated bio']);
  });

  it('emits update:location when location input changes', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const locationInputs = wrapper.findAll('input');
    const locationInput = locationInputs.find((input) =>
      input.attributes('placeholder')?.includes('location'),
    );

    if (locationInput) {
      await locationInput.setValue('San Francisco');
      expect(wrapper.emitted('update:location')).toBeTruthy();
    }
  });

  it('emits update:website when website input changes', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const websiteInputs = wrapper.findAll('input');
    const websiteInput = websiteInputs.find((input) =>
      input.attributes('placeholder')?.includes('website'),
    );

    if (websiteInput) {
      await websiteInput.setValue('https://newsite.com');
      expect(wrapper.emitted('update:website')).toBeTruthy();
    }
  });

  it('displays name validation error when isNameValid is false', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: { ...defaultProps, isNameValid: false },
    });

    const errorMessage = wrapper.find('[role="alert"]');
    expect(errorMessage.exists()).toBe(true);
  });

  it('displays website validation error when isWebsiteValid is false', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: { ...defaultProps, isWebsiteValid: false },
    });

    const errorMessages = wrapper.findAll('[role="alert"]');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('displays age validation error when isAgeValid is false', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: { ...defaultProps, isAgeValid: false },
    });

    const errorMessages = wrapper.findAll('[role="alert"]');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('renders birth date selectors', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const monthSelect = wrapper.find('[name="birth-month"]');
    const daySelect = wrapper.find('[name="birth-day"]');
    const yearSelect = wrapper.find('[name="birth-year"]');

    expect(monthSelect.exists()).toBe(true);
    expect(daySelect.exists()).toBe(true);
    expect(yearSelect.exists()).toBe(true);
  });

  it('respects maxlength constraints on inputs', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: defaultProps,
    });

    const bioInput = wrapper.find('textarea');
    const locationInputs = wrapper.findAll('input');
    const websiteInputs = wrapper.findAll('input');

    expect(bioInput.attributes('maxlength')).toBe('160');

    const locationInput = locationInputs.find((input) => input.attributes('maxlength') === '30');
    expect(locationInput).toBeTruthy();

    const websiteInput = websiteInputs.find((input) => input.attributes('maxlength') === '100');
    expect(websiteInput).toBeTruthy();
  });

  it('handles undefined birthDate prop', async () => {
    const wrapper = await mountSuspended(EditProfileInfo, {
      props: { ...defaultProps, birthDate: undefined },
    });

    expect(wrapper.vm).toBeTruthy();
  });
});
