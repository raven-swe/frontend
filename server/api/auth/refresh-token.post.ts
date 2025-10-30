import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const clientCookie = getHeader(event, 'cookie');
  const response = await serverApiFetch.raw<ApiSuccessResponse<{ accessToken: string }>>(
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

  if (response._data?.data.accessToken) {
    const accessTokenContent = jwt.decode(response._data.data.accessToken) as { exp: number };
    appendHeader(
      event,
      'set-cookie',
      cookie.serialize('access_token', response._data?.data.accessToken, {
        path: '/',
        maxAge: accessTokenContent?.exp
          ? accessTokenContent.exp - Math.floor(Date.now() / 1000)
          : 60 * 5, // Default to 5 minutes if exp is missing
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }),
    );
  }
  return response._data;
});
