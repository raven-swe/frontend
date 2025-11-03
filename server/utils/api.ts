import { $fetch } from 'ofetch';
import type { H3Event } from 'h3';
const API_URL = process.env.BACKEND_URL || 'https://example.com';

export const serverApiFetch = (event: H3Event) =>
  $fetch.create({
    baseURL: API_URL,
    credentials: 'include',

    onRequest({ options }) {
      if (event) {
        const ip = getRequestIP(event, { xForwardedFor: true });
        if (ip) options.headers.append('X-Client-IP', ip);

        const authHeader = getHeader(event, 'Authorization');
        if (authHeader) options.headers.append('Authorization', authHeader);
      }
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
