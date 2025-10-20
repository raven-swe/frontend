import { FetchError } from 'ofetch';

interface ApiError {
  message: string;
}

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  try {
    // Forward the request to your backend API
    const response = await $fetch<{
      success: boolean;
      message: string;
    }>(`${API_URL}/tweets/${id}/retweet`, {
      method: 'POST',
    });

    return response;
  } catch (e) {
    if (e instanceof FetchError) {
      const errData = e.data as ApiError;
      throw createError({
        message: errData?.message || 'Failed to create tweet',
        statusCode: e.statusCode || 500,
      });
    }

    throw createError({
      message: 'Unexpected error creating tweet',
      statusCode: 500,
    });
  }
});
