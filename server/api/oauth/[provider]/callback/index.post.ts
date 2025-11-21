import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const { provider } = event.context.params as { provider: string };
  const body = await readBody<OAuthCallbackRequest>(event);
  const fetcher = serverApiFetch(event);

  const response = await fetcher.raw<ApiSuccessResponse<OAuthCallbackResponse>>(
    `/oauth/${provider}/callback`,
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
