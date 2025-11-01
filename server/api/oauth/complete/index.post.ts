import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import type { OAuthTokenRequest, OAuthCallbackResponse } from '~~/shared/types/oauth';

export default defineEventHandler(async (event) => {
  const body = await readBody<OAuthTokenRequest>(event);

  const response = await serverApiFetch.raw<ApiSuccessResponse<OAuthCallbackResponse>>(
    '/oauth/complete',
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
  if (response._data?.data && 'accessToken' in response._data.data) {
    const accessTokenContent = jwt.decode(response._data.data.accessToken) as { exp?: number };
    appendHeader(
      event,
      'set-cookie',
      cookie.serialize('access_token', response._data!.data.accessToken, {
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
