import { FetchError } from 'ofetch';

interface ApiError {
  message: string;
}

const API_URL = process.env.BACKEND_URL;

export default defineEventHandler(async (event) => {
  const { username } = event.context.params as { username: string };
  try {
    const user = await $fetch<{
      id: string;
      name: string;
      username: string;
    }>(`${API_URL}/user/${username}`);
    return user;
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
