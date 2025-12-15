import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  return await fetcher<ApiSuccessResponse<Tweet[]>>('/search/tweets', {
    method: 'GET',
    query: {
      query: query.query,
      tab: query.tab,
      limit: query.limit,
      cursor: query.cursor ?? undefined,
      peopleFilter: query.peopleFilter,
      excludeMutedAndBlocked: query.excludeMutedAndBlocked,
    },
  });
});
