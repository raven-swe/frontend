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
  return response._data;
});
