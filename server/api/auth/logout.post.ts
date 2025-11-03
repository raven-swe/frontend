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
  const cookies = response.headers.getSetCookie?.();
  cookies.forEach((cookie) => {
    appendHeader(event, 'set-cookie', cookie);
  });
  return response._data;
});
