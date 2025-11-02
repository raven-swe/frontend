import { $fetch } from 'ofetch';
const API_URL = process.env.BACKEND_URL || 'https://example.com';

export const serverApiFetch = $fetch.create({
  baseURL: API_URL,
  credentials: 'include',

  onRequest({ options }) {
    // Ensure the X-Client-Type header is set to web
    options.headers.append('X-Client-Type', 'web');
  },

  async onResponseError({ response }) {
    throw createError({
      statusCode: response.status,
      statusMessage: response._data?.error?.message || response._data?.message || 'Server Error',
      data: response._data,
    });
  },
});
