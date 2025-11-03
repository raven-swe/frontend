export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ otp: string; confirmationToken: string }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<
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
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  return response;
});
