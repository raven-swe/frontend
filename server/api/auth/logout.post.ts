import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import type { ApiResponseBase } from '~~/shared/types/api';

export default defineWrappedResponseHandler(async (event) => {
  const cookie = getHeader(event, 'cookie');
  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch.raw<ApiResponseBase>('/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(cookie ? { cookie } : {}), // Forward client cookies
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  deleteCookie(event, 'access_token', { path: '/' });
  deleteCookie(event, 'refresh_token', { path: '/' });
  return response._data;
});
