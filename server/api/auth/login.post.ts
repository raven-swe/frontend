import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import { setAuthCookies } from '~~/server/utils/auth/setAuthCookies';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher.raw<ApiSuccessResponse<{ accessToken: string }>>('/auth/login', {
    method: 'POST',
    body,
    credentials: 'include',
  });

  setAuthCookies(event, response);
  return response._data;
});
