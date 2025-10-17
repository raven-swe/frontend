import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  // read search param here please
  const query = getQuery(event);
  const email = query.email as string;
  try {
    const response = await $fetch<ApiSuccessResponse<{ exists: boolean }>>(
      `${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
      },
    );
    return response;
  } catch (error) {
    const typedError = error as { data: unknown; status: number };
    const response = typedError.data as ApiErrorResponse | ApiValidationErrorResponse | undefined;

    if (response?.error) {
      throw createError({
        statusCode: typedError.status || 500,
        statusMessage: response.error.message || 'Internal Server Error',
        data: response.error,
      });
    }

    throw createError({
      statusCode: typedError.status || 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
