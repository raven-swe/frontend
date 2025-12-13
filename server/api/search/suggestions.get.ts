import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  return await fetcher<ApiSuccessResponse<string[]>>('/search/suggestions', {
    method: 'GET',
    query: {
      query: query.query,
    },
  });
});
