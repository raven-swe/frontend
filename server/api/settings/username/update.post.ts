import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ newUsername: string }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
    '/me/username',
    {
      method: 'POST',
      query: {
        newUsername: query.newUsername,
      },
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    },
  );
  return response;
});
