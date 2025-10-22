import * as cookie from 'cookie';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await serverApiFetch.raw<ApiSuccessResponse<{ accessToken: string }>>(
    '/auth/register/complete',
    {
      method: 'POST',
      body,
      credentials: 'include',
    },
  );

  const cookies = response.headers.getSetCookie?.();
  cookies.forEach((cookie) => {
    appendHeader(event, 'set-cookie', cookie);
  });
  if (response._data?.data.accessToken) {
    appendHeader(
      event,
      'set-cookie',
      cookie.serialize('access_token', response._data?.data.accessToken, {
        path: '/',
        maxAge: 60 * 5,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }),
    );
  }
  return response._data;
});
