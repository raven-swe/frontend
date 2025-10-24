import { ofetch } from 'ofetch';
import { createError } from 'h3';

const API_URL = process.env.BACKEND_URL;

export const serverApiFetch = ofetch.create({
  baseURL: API_URL,
  credentials: 'include',

  onRequest({ options }) {
    // Ensure cookies are included in server-side requests
    options.headers.append('X-Client-Type', 'web');
  },

  async onResponseError({ response }) {
    throw createError({
      statusCode: response.status || 500,
      statusMessage: response._data?.error?.message || response._data?.message || 'Server Error',
      data: response._data?.error || response._data,
    });
  },
});
