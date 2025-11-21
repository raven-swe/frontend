import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ newUsername: string }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ exists: boolean; type: string }>>(
    '/me/settings/username',
    {
      method: 'PATCH',
      body: {
        newUsername: query.newUsername,
      },
    },
  );
  return response;
});
