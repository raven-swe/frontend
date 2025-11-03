import type { ApiSuccessResponse } from '~~/shared/types/api';
import type { OAuthCallbackResponse } from '~~/shared/types/oauth';

export default defineWrappedResponseHandler(async (event) => {
  const { provider } = event.context.params as { provider: string };
  const body = await readBody<OAuthCallbackRequest>(event);

  const response = await serverApiFetch.raw<ApiSuccessResponse<OAuthCallbackResponse>>(
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
  return response._data;
});
