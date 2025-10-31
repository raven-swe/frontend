import { FetchError } from 'ofetch';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import type { OAuthCallbackResponse } from '~~/shared/types/oauth';

interface ApiError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const { provider } = event.context.params as { provider: string };
  const body = await readBody<OAuthCallbackRequest>(event);

  const API_URL = process.env.BACKEND_URL;

  try {
    const response = await $fetch<ApiSuccessResponse<OAuthCallbackResponse>>(
      `${API_URL}/oauth/${provider}/callback`,
      {
        method: 'POST',
        body: {
          providerToken: body.code,
        },
      },
    );
    return response;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiError;
      return {
        success: false,
        error: {
          code: 'OAUTH_CALLBACK_FAILED',
          message: errData?.message || 'OAuth callback request failed',
        },
      };
    }
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
});
