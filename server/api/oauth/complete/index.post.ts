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
  return response._data;
});
