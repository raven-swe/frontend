import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const body = getQuery<{
    currentPassword: string;
    newPassword: string;
  }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<
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
  });
  return response;
});
