import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

import { FetchError } from 'ofetch';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  // read search param here please
  const query = getQuery(event);
  const identifier = query.identifier as string;
  try {
    const response = await $fetch<ApiSuccessResponse<{ exists: boolean; type: string | null }>>(
      `${API_URL}/auth/check-identifier?identifier=${encodeURIComponent(identifier)}`,
      {
        method: 'GET',
      },
    );
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

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
});
