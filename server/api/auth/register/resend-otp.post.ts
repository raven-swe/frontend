import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  return await serverApiFetch<ApiResponseBase>('/auth/register/resend-otp', {
    method: 'POST',
    body,
  });
});
