import { FetchError } from 'ofetch';

function backendValidationToFormErrors(
  errors: Array<{ field: string; code: string }>,
  t: (key: string) => string,
): Record<string, string> {
  return errors.reduce((acc: Record<string, string>, { field, code }) => {
    acc[field] = t(`errors.${field}.${code}`);
    return acc;
  }, {});
}

function isApiError(
  error: unknown,
): error is FetchError<FetchError<ApiErrorResponse | ApiValidationErrorResponse>> {
  return error instanceof FetchError;
}

function isApiValidationError(
  error: unknown,
): error is FetchError<FetchError<ApiValidationErrorResponse>> {
  return error instanceof FetchError && error.data.statusCode === 422;
}

const withApiValidationErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  fallbackMessage?: string,
) => {
  try {
    return await apiCall();
  } catch (error) {
    if (isApiValidationError(error)) {
      const errors = error.data?.data?.error.errors;
      return errors;
    } else if (isApiError(error)) {
      const apiError = error.data?.data;
      showToaster('error', apiError?.message || fallbackMessage || 'An error occurred');
    } else {
      showToaster('error', fallbackMessage || 'An error occurred');
    }
  }
};

export {
  backendValidationToFormErrors,
  isApiError,
  isApiValidationError,
  withApiValidationErrorHandling,
};
