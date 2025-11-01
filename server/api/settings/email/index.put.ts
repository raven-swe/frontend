export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ newEmail: string }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<
    ApiSuccessResponse<{
      success: boolean;
      message: string;
    }>
  >('/me/email', {
    method: 'PUT',
    body: {
      newEmail: body.newEmail,
    },
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  return response;
});
