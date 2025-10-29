import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ identifier: string }>(event);
  const response = await serverApiFetch<ApiSuccessResponse<{ exists: boolean; type: string }>>(
    '/auth/check-identifier',
    {
      method: 'GET',
      query: {
        identifier: query.identifier,
      },
    },
  );
  return response;
});
