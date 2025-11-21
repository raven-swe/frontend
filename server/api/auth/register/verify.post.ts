import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<{ creationToken: string }>>('/auth/register/verify', {
    method: 'POST',
    body,
  });
});
