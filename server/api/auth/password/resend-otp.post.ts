import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiResponseBase>('/auth/password/resend-otp', {
    method: 'POST',
    body,
  });
  return response;
});
