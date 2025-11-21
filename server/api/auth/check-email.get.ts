import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ email: string }>(event);
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<{ exists: boolean }>>('/auth/check-email', {
    method: 'GET',
    query: {
      email: query.email,
    },
  });
});
