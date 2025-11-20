import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  return await serverApiFetch<ApiSuccessResponse<{ confirmationToken: string }>>(
    `/auth/password/forgot`,
    {
      method: 'POST',
      body,
    },
  );
});
