import {
  isApiError,
  isApiValidationError,
  withApiValidationErrorHandling,
  backendValidationToFormErrors,
} from '~/utils/errorUtils';

import { it, describe, expect, vi } from 'vitest';
import { FetchError } from 'ofetch';

describe('isApiError', () => {
  it('returns true for FetchError', () => {
    const error = new FetchError('Error', {
      cause: { statusCode: 500, data: {} },
    });
    expect(isApiError(error)).toBe(true);
  });

  it('returns false for non-FetchError', () => {
    const error = new Error('Some other error');
    expect(isApiError(error)).toBe(false);
  });
});

describe('isApiValidationError', () => {
  it('returns true for FetchError with 422 status code', () => {
    const error = new FetchError('Validation Error');
    error.data = {
      statusCode: 422,
      data: {},
    };
    expect(isApiValidationError(error)).toBe(true);
  });

  it('returns false for FetchError with non-422 status code', () => {
    const error = new FetchError('Error');
    error.data = {
      statusCode: 500,
      data: {},
    };
    expect(isApiValidationError(error)).toBe(false);
  });

  it('returns false for non-FetchError', () => {
    const error = new Error('Some other error');
    expect(isApiValidationError(error)).toBe(false);
  });
});

describe('withApiValidationErrorHandling', () => {
  it('returns result of successful apiCall', async () => {
    const apiCall = vi.fn().mockResolvedValue('success');
    const result = await withApiValidationErrorHandling(apiCall);
    expect(result).toBe('success');
    expect(apiCall).toHaveBeenCalled();
  });

  it('returns validation errors for ApiValidationError', async () => {
    const mockErrors = [
      { field: 'email', code: 'invalid' },
      { field: 'password', code: 'required' },
    ];
    const error = new FetchError('Validation Error');
    error.data = {
      statusCode: 422,
      data: {
        error: {
          errors: mockErrors,
        },
      },
    };

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall);
    expect(result).toBe(mockErrors);
    expect(apiCall).toHaveBeenCalled();
  });

  it('shows toaster for other ApiErrors', async () => {
    const showToasterSpy = vi.spyOn(await import('~/utils/showToaster'), 'showToaster');
    const error = new FetchError('API Error');
    error.data = {
      statusCode: 500,
      data: {
        message: 'Internal Server Error',
      },
    };

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall, 'Fallback error message');

    expect(result).toBeUndefined();
    expect(apiCall).toHaveBeenCalled();
    expect(showToasterSpy).toHaveBeenCalledWith('error', 'Internal Server Error');
  });

  it('shows toaster with fallback message when ApiError has no message', async () => {
    const showToasterSpy = vi.spyOn(await import('~/utils/showToaster'), 'showToaster');
    const error = new FetchError('API Error');
    error.data = {
      statusCode: 500,
      data: {},
    };

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall, 'Fallback error message');

    expect(result).toBeUndefined();
    expect(apiCall).toHaveBeenCalled();
    expect(showToasterSpy).toHaveBeenCalledWith('error', 'Fallback error message');
  });

  it('show toaster with default message when ApiError has no message and no fallback is provided', async () => {
    const showToasterSpy = vi.spyOn(await import('~/utils/showToaster'), 'showToaster');
    const error = new FetchError('API Error');
    error.data = {
      statusCode: 500,
      data: {},
    };

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall);

    expect(result).toBeUndefined();
    expect(apiCall).toHaveBeenCalled();
    expect(showToasterSpy).toHaveBeenCalledWith('error', 'An error occurred');
  });

  it('shows toaster for non-ApiErrors', async () => {
    const showToasterSpy = vi.spyOn(await import('~/utils/showToaster'), 'showToaster');
    const error = new Error('Some other error');

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall, 'Fallback error message');

    expect(result).toBeUndefined();
    expect(apiCall).toHaveBeenCalled();
    expect(showToasterSpy).toHaveBeenCalledWith('error', 'Fallback error message');
  });

  it('shows toaster with default message when no fallback is provided', async () => {
    const showToasterSpy = vi.spyOn(await import('~/utils/showToaster'), 'showToaster');
    const error = new Error('Some other error');

    const apiCall = vi.fn().mockRejectedValue(error);
    const result = await withApiValidationErrorHandling(apiCall);

    expect(result).toBeUndefined();
    expect(apiCall).toHaveBeenCalled();
    expect(showToasterSpy).toHaveBeenCalledWith('error', 'An error occurred');
  });
});

describe('backendValidationToFormErrors', () => {
  it('maps backend validation errors to form errors using translation function', () => {
    const errors = [
      { field: 'email', code: 'invalid' },
      { field: 'password', code: 'required' },
    ];
    const t = (key: string) => {
      const translations: Record<string, string> = {
        'errors.email.invalid': 'Email is invalid',
        'errors.password.required': 'Password is required',
      };
      return translations[key] || key;
    };

    const result = backendValidationToFormErrors(errors, t);
    expect(result).toEqual({
      email: 'Email is invalid',
      password: 'Password is required',
    });
  });
});
