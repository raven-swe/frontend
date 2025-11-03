export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ newEmail: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<
    ApiSuccessResponse<{
      success: boolean;
      message: string;
    }>
  >('/me/settings/email', {
    method: 'PUT',
    body: {
      newEmail: body.newEmail,
    },
  });
  return response;
});
