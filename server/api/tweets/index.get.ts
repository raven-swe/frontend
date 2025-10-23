import { FetchError } from 'ofetch';
import type { Tweet } from '~~/shared/types/tweets';

interface ApiError {
  message: string;
}

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async () => {
  try {
    const tweets = await $fetch<Tweet[]>(`${API_URL}/tweets`);
    return tweets;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiError;
      throw createError({
        message: errData?.message || 'Request failed',
        statusCode: e.statusCode || 500,
      });
    }

    // Generic error fallback
    throw createError({
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
});
