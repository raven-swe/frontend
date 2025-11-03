export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ otp: string; confirmationToken: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<
    ApiSuccessResponse<{
      success: boolean;
      message: string;
    }>
  >('/me/settings/email/verify', {
    method: 'POST',
    body: {
      otp: body.otp,
      confirmationToken: body.confirmationToken,
    },
  });
  return response;
});
