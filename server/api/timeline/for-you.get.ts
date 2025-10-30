import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';
import type { Tweet } from '~~/shared/types/tweets';
import type { timelineSchema, Pagination } from '~~/app/services/home/homeService';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as timelineSchema;

  try {
    const response = await $fetch<ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>>(
      `${API_URL}/timeline/for-you`,
      {
        params: query,
      },
    );

    return response;
  } catch (error) {
    const response = (error as { data?: unknown })?.data as
      | ApiErrorResponse
      | ApiValidationErrorResponse
      | undefined;

    if (response?.error?.code === 'VALIDATION_ERROR') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: response.error,
      });
    }

    if (response?.error?.code === 'UNAUTHORIZED') {
      throw createError({
        statusCode: 401,
        statusMessage: response.error.message || 'Unauthorized',
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
