import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const response = await $fetch<ApiSuccessResponse<{ creationToken: string }>>(
      `${API_URL}/auth/register/start`,
      {
        method: 'POST',
        body,
      },
    );
    return response;
  } catch (error) {
    const response = (error as { data: unknown }).data as
      | ApiErrorResponse
      | ApiValidationErrorResponse
      | undefined;
    if (response?.error?.code === 'VALIDATION_ERROR') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: response.error,
      });
    }

    if (response?.error) {
      throw createError({
        statusCode: 500,
        statusMessage: response.error.message || 'Internal Server Error',
        data: response.error,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
