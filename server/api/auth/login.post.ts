import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const response = await $fetch<
      ApiSuccessResponse<{
        accessToken: string;
        refreshToken: string;
      }>
    >(`${API_URL}/auth/login`, {
      method: 'POST',
      body,
    });

    // ✅ Return the tokens on success
    return response;
  } catch (error) {
    const response = (error as { data?: unknown })?.data as
      | ApiErrorResponse
      | ApiValidationErrorResponse
      | undefined;

    // 🧠 Handle validation errors (422)
    if (response?.error?.code === 'VALIDATION_ERROR') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: response.error,
      });
    }

    // 🔒 Handle unauthorized (401)
    if (response?.error?.code === 'UNAUTHORIZED') {
      throw createError({
        statusCode: 401,
        statusMessage: response.error.message || 'Invalid credentials',
        data: response.error,
      });
    }

    // 🧨 Handle general errors
    if (response?.error) {
      throw createError({
        statusCode: 500,
        statusMessage: response.error.message || 'Internal Server Error',
        data: response.error,
      });
    }

    // 🪲 Fallback error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
