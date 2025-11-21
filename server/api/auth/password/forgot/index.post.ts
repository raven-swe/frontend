import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ confirmationToken: string }>>(
    '/auth/password/forgot',
    {
      method: 'POST',
      body,
    },
  );
  return response;
});
