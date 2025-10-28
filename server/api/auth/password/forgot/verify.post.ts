import type {
  ApiResponseBase,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

import { FetchError } from 'ofetch';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const response = await $fetch<ApiResponseBase>(`${API_URL}/auth/password/forgot/verify`, {
      method: 'POST',
      body,
    });
    return response;
  } catch (error) {
    if (error instanceof FetchError) {
      const fetchError = error as FetchError<ApiErrorResponse | ApiValidationErrorResponse>;

      throw createError({
        statusCode: fetchError.status ?? 500,
        statusMessage: fetchError.data?.error?.message ?? 'Internal Server Error',
        data: fetchError.data?.error,
      });
    }

    // Fallback for non-Fetch errors
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
});
