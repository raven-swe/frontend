import {
  isOAuthResponseWithAccessToken,
  setAuthCookies,
} from '~~/server/utils/auth/setAuthCookies';

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

  if (isOAuthResponseWithAccessToken(response)) {
    setAuthCookies(event, response);
  }

  return response._data;
});
