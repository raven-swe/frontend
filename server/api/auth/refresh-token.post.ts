import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const clientCookie = getHeader(event, 'cookie');
  const fetcher = serverApiFetch(event);
  const response = await fetcher.raw<ApiSuccessResponse<{ accessToken: string }>>(
    '/auth/refresh-token',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(clientCookie ? { cookie: clientCookie } : {}), // Forward client cookies
      },
    },
  );

  const cookies = response.headers.getSetCookie?.();
  cookies.forEach((cookie) => {
    appendHeader(event, 'set-cookie', cookie);
  });

  return response._data;
});
