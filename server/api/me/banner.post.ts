import { FetchError } from 'ofetch';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '~~/shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  try {
    const response = await $fetch<ApiSuccessResponse<{ success: boolean; message: string }>>(
      `${API_URL}/me/banner`,
      {
        method: 'POST',
        body: event.node.req,
        headers: {
          'content-type': event.node.req.headers['content-type']!,
        },
      },
    );

    return response;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiErrorResponse | ApiValidationErrorResponse;
      throw createError({
        message: errData?.error?.message || 'Request failed',
        statusCode: e.statusCode || 500,
      });
    }

    // Re-throw createError instances
    if (e && typeof e === 'object' && 'statusCode' in e) {
      throw e;
    }

    // Generic error fallback
    throw createError({
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
});
