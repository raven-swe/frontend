import { serverApiFetch } from '~~/server/utils/api';

export default defineEventHandler(async (event) => {
  const cookie = getHeader(event, 'cookie');
  const response = await serverApiFetch.raw<ApiSuccessResponse<{ accessToken: string }>>(
    '/auth/refresh-token',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(cookie ? { cookie } : {}), // Forward client cookies
      },
    },
  );

  const cookies = response.headers.getSetCookie?.();
  cookies.forEach((cookie) => {
    appendHeader(event, 'set-cookie', cookie);
  });
  return response._data;
});
