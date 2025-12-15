import { describe, it, expect, vi } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import { useInterestsForm } from '~/composables/useInterestsForm';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'setting.interests.update-success': 'Updated',
      'errors.UNKNOWN_ERROR': 'Unknown error',
      'errors.interests.REQUIRED': 'Required',
      'errors.SOME_ERROR_CODE': 'Some error occurred',
    },
  },
});

const settingsServiceMock = vi.hoisted(() => {
  return {
    getInterests: vi.fn(() => ({
      data: {
        interests: [
          { code: 'sports', isSelected: true },
          { code: 'music', isSelected: false },
        ],
      },
    })),
    updateInterests: vi.fn(() => undefined),
  };
});

vi.mock('~/services/settingsService', () => ({
  settingsService: settingsServiceMock,
}));

vi.mock('~/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

const apliValidationMock = vi.hoisted(() => {
  return {
    isApiValidationError: vi.fn(() => false),
    isApiError: vi.fn(() => false),
    backendValidationToFormErrors: vi.fn(() => ({})),
  };
});

vi.mock('~/utils/errorUtils', () => ({
  ...apliValidationMock,
}));

function runInVueContext<T>(fn: () => T) {
  let result: T | undefined;

  mount(
    defineComponent({
      setup() {
        result = fn();
        return () => h('div');
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }], i18n],
      },
    },
  );
  return result!;
}

describe('useInterestsForm', () => {
  it('load interest and selected interests', async () => {
    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { interests, isInterestActive } = composable;
    expect(interests.value).toEqual([
      { code: 'sports', isSelected: true },
      { code: 'music', isSelected: false },
    ]);
    expect(isInterestActive('sports')).toBe(true);
    expect(isInterestActive('music')).toBe(false);
  });

  it('toggle interests successfully', async () => {
    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { handleToggleInterest, isInterestActive } = composable;
    handleToggleInterest('music');
    expect(isInterestActive('music')).toBe(true);
    handleToggleInterest('sports');
    expect(isInterestActive('sports')).toBe(false);
  });

  it('submit selected interests successfully', async () => {
    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { handleToggleInterest, onSubmit } = composable;
    handleToggleInterest('music');
    await onSubmit();
    // this will import the mocked service
    const { settingsService } = await import('~/services/settingsService');
    expect(settingsService.updateInterests).toHaveBeenCalledWith(['sports', 'music']);
  });

  it('selectedOne is true when there is at least one selected interest', async () => {
    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { selectedOne, handleToggleInterest } = composable;
    expect(selectedOne.value).toBe(true); // 'sports' is initially selected
    handleToggleInterest('sports'); // Deselect 'sports'
    expect(selectedOne.value).toBe(false);
    handleToggleInterest('music'); // Select 'music'
    expect(selectedOne.value).toBe(true);
  });

  it('shows error toaster on submit failure', async () => {
    apliValidationMock.isApiValidationError.mockReturnValueOnce(false);
    apliValidationMock.isApiError.mockReturnValueOnce(true);

    settingsServiceMock.updateInterests.mockRejectedValue({
      data: {
        data: {
          error: {
            code: 'SOME_ERROR_CODE',
          },
        },
      },
    });

    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { onSubmit, errors } = composable;
    await onSubmit();
    await flushPromises();
    const { showToaster } = await import('~/utils/showToaster');
    expect(showToaster).toHaveBeenCalledWith('error', 'Some error occurred');
    expect(errors.value).toEqual({}); // No form field errors
  });

  it('sets form errors on validation error', async () => {
    apliValidationMock.isApiValidationError.mockReturnValueOnce(true);
    apliValidationMock.backendValidationToFormErrors.mockReturnValueOnce({
      interests: 'Required',
    });

    settingsServiceMock.updateInterests.mockRejectedValue({
      data: {
        data: {
          error: {
            errors: [{ field: 'interests', code: 'REQUIRED' }],
          },
        },
      },
    });

    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { onSubmit, errors } = composable;
    await onSubmit();
    await flushPromises();
    expect(errors.value).toEqual({ interests: 'Required' });
  });

  it('show sucess toaster on successful update', async () => {
    const composable = runInVueContext(() => useInterestsForm());
    await flushPromises();
    const { onSubmit } = composable;
    await onSubmit();
    await flushPromises();
    const { showToaster } = await import('~/utils/showToaster');
    expect(showToaster).toHaveBeenCalledWith('success', 'Updated');
  });
});
