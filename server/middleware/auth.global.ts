import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refreshToken');
  const accessToken = getCookie(event, 'access_token');
  const authHeader = getHeader(event, 'Authorization');
  if (!refreshToken || authHeader || accessToken) return;

  const clientCookie = getHeader(event, 'cookie');

  const fetcher = serverApiFetch(event);
  try {
    const response = await fetcher.raw<ApiSuccessResponse<{ accessToken: string }>>(
      '/auth/refresh-token',
      {
        method: 'POST',
        headers: {
          ...(clientCookie ? { cookie: clientCookie } : {}), // Forward client cookies
        },
      },
    );
    const cookies = response.headers.getSetCookie();
    cookies?.forEach((cookie) => {
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
  } catch {
    deleteCookie(event, 'refreshToken');
    deleteCookie(event, 'access_token');
    sendRedirect(event, '/', 401);
  }
});
