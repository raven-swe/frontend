import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ timeline: TimelineSchema }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<Tweet[]>>('/timeline/following', {
    method: 'GET',
    query: query,
  });
  return response;
});
