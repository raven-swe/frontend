import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const response = await serverApiFetch.raw<ApiSuccessResponse<{ accessToken: string }>>(
    '/auth/login',
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
