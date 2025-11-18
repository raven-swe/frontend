import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ newEmail: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<
    ApiSuccessResponse<{
      confirmationToken: string;
    }>
  >('/me/settings/email', {
    method: 'PUT',
    body: {
      newEmail: body.newEmail,
    },
  });
  return response;
});
