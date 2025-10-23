import { FetchError } from 'ofetch';
import type { OAuthTokenRequest, OAuthCallbackResponse } from '../../../../shared/types/oauth';

interface ApiError {
  message: string;
}

export default defineEventHandler(async (event): Promise<OAuthCallbackResponse> => {
  const body = await readBody<OAuthTokenRequest>(event);

  const API_URL = process.env.BACKEND_URL;

  try {
    const response = await $fetch<OAuthCallbackResponse>(`${API_URL}/oauth/complete`, {
      method: 'POST',
      body: {
        creationToken: body.creationToken,
        birthDate: body.birthDate,
      },
    });
    return response;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiError;
      return {
        success: false,
        message: errData?.message || 'OAuth complete request failed',
        data: { creationToken: '' },
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred',
      data: { creationToken: '' },
    };
  }
});
