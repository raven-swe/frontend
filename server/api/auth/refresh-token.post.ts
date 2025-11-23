import { setAuthCookies } from '~~/server/utils/auth/setAuthCookies';
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

  setAuthCookies(event, response);
  return response._data;
});
