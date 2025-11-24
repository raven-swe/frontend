import {
  isOAuthResponseWithAccessToken,
  setAuthCookies,
} from '~~/server/utils/auth/setAuthCookies';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<OAuthTokenRequest>(event);
  const fetcher = serverApiFetch(event);

  const response = await fetcher.raw<ApiSuccessResponse<OAuthCallbackResponse>>('/oauth/complete', {
    method: 'POST',
    body,
    credentials: 'include',
  });

  if (isOAuthResponseWithAccessToken(response)) {
    setAuthCookies(event, response);
  }

  return response._data;
});
