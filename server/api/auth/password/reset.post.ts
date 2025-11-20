import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  return await serverApiFetch<ApiSuccessResponse<{ accessToken: string; refreshToken: string }>>(
    `/auth/password/reset`,
    {
      method: 'POST',
      body,
    },
  );
});
