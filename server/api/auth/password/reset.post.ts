import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/password/reset',
    {
      method: 'POST',
      body,
    },
  );
  return response;
});
