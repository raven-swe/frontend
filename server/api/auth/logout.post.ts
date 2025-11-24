import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import type { ApiResponseBase } from '~~/shared/types/api';

export default defineWrappedResponseHandler(async (event) => {
  const cookie = getHeader(event, 'cookie');
  const fetcher = serverApiFetch(event);
  const response = await fetcher.raw<ApiResponseBase>('/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(cookie ? { cookie } : {}), // Forward client cookies
    },
  });
  deleteCookie(event, 'access_token', { path: '/' });
  deleteCookie(event, 'refreshToken', { path: '/' });
  return response._data;
});
