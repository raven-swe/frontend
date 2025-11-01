export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ confirmationToken: string }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<
    ApiSuccessResponse<{
      success: boolean;
      message: string;
    }>
  >('/me/email/resend-otp', {
    method: 'POST',
    body: {
      confirmationToken: body.confirmationToken,
    },
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  return response;
});
