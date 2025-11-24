import type { CreateTweetRequest, Tweet } from '~~/shared/types/tweets';
import type { ApiSuccessResponse } from '~~/shared/types/api';
import { apiFetch } from '~/api';

export async function createTweetService(payload: CreateTweetRequest): Promise<Tweet> {
  try {
    const response = await apiFetch<ApiSuccessResponse<Tweet>>('/api/tweets', {
      method: 'POST',
      body: payload,
    });

    return response.data;
  } catch (error) {
    console.error('Failed to create tweet:', error);
    throw error;
  }
}
