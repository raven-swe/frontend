import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  return await serverApiFetch<ApiResponseBase>(`/auth/password/forgot/verify`, {
    method: 'POST',
    body,
  });
});
