import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import type { FetchResponse } from 'ofetch';

export function setAuthCookies(
  event: H3Event,
  response: FetchResponse<
    ApiSuccessResponse<{
      accessToken: string;
    }>
  >,
) {
  const cookies = response.headers.getSetCookie();
  cookies.forEach((cookieString) => {
    const parsedCookie = cookie.parse(cookieString);
    if (parsedCookie.refreshToken) {
      const maxAge = parsedCookie['Max-Age'];
      const expires = parsedCookie['Expires'];
      setCookie(event, 'refreshToken', parsedCookie.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
        expires: expires ? new Date(expires) : undefined,
      });
    }
  });

  if (response._data?.data.accessToken) {
    const accessTokenContent = jwt.decode(response._data.data.accessToken) as { exp?: number };
    setCookie(event, 'access_token', response._data?.data.accessToken, {
      path: '/',
      maxAge: accessTokenContent?.exp
        ? accessTokenContent.exp - Math.floor(Date.now() / 1000)
        : 60 * 5, // Default to 5 minutes if exp is missing
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}

export function isOAuthResponseWithAccessToken(
  response: FetchResponse<ApiSuccessResponse<object>> | null | undefined,
): response is FetchResponse<ApiSuccessResponse<{ accessToken: string }>> {
  if (!response || !response._data || !response._data.data) return false;
  return 'accessToken' in response._data.data;
}
