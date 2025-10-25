import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

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
    const accessTokenContent = jwt.decode(response._data.data.accessToken) as { exp: number };
    appendHeader(
      event,
      'set-cookie',
      cookie.serialize('access_token', response._data!.data.accessToken, {
        path: '/',
        maxAge: accessTokenContent.exp - Math.floor(Date.now() / 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }),
    );
  }
  return response._data;
});
