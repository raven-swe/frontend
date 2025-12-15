import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<Tweet[]>>('/timeline/for-you', {
    method: 'GET',
    query: query,
  });
  return response;
});
