import { FetchError } from 'ofetch';
import type {
  OAuthCallbackRequest,
  OAuthCallbackResponse,
} from '../../../../../shared/types/oauth';

interface ApiError {
  message: string;
}

export default defineEventHandler(async (event): Promise<OAuthCallbackResponse> => {
  const provider = event.context.params as { provider: string };
  const body = await readBody<OAuthCallbackRequest>(event);

  const API_URL = process.env.BACKEND_URL;

  try {
    const response = await $fetch<OAuthCallbackResponse>(`${API_URL}/oauth/${provider}/callback`, {
      method: 'POST',
      body: {
        provider_token_id: body.code,
      },
    });
    return response;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiError;
      return {
        success: false,
        message: errData?.message || 'OAuth callback request failed',
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
