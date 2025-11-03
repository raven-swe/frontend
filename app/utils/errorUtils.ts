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

export { backendValidationToFormErrors, isApiError, isApiValidationError };
