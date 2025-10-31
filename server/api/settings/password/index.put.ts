import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const body = getQuery<{
    currentPassword: string;
    newPassword: string;
  }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<
    ApiSuccessResponse<{
      success: boolean;
      message: string;
    }>
  >('/me/password', {
    method: 'PUT',
    body: {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    },
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  return response;
});
