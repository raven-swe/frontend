import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ otp: string; confirmationToken: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiResponseBase>('/me/settings/email/verify', {
    method: 'POST',
    body: {
      otp: body.otp,
      confirmationToken: body.confirmationToken,
    },
  });
  return response;
});
