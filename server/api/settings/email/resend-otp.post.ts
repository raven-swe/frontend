import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ confirmationToken: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiResponseBase>('/me/settings/email/resend-otp', {
    method: 'POST',
    body: {
      confirmationToken: body.confirmationToken,
    },
  });
  return response;
});
