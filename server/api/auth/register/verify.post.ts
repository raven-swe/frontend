import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  return await serverApiFetch<ApiSuccessResponse<{ creationToken: string }>>(
    '/auth/register/verify',
    {
      method: 'POST',
      body,
    },
  );
});
